// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./GreenHydrogenCredits.sol";

/**
 * @title HydrogenCreditsMarketplace
 * @dev Marketplace for trading green hydrogen credits
 * Supports order book, auctions, and direct sales
 */
contract HydrogenCreditsMarketplace is ReentrancyGuard, Ownable, Pausable {
    
    GreenHydrogenCredits public immutable creditsContract;
    IERC20 public paymentToken; // Stablecoin for payments (e.g., USDC)
    
    // Market fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketFeeBps = 250;
    address public feeRecipient;
    
    // Order types
    enum OrderType { Buy, Sell }
    enum OrderStatus { Active, Filled, Cancelled, Expired }
    
    // Order structure
    struct Order {
        uint256 orderId;
        address trader;
        OrderType orderType;
        uint256 tokenId;
        uint256 volume;
        uint256 pricePerUnit; // Price per kg in payment token
        uint256 filledVolume;
        OrderStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        bool partialFillAllowed;
    }
    
    // Auction structure
    struct Auction {
        uint256 auctionId;
        address seller;
        uint256 tokenId;
        uint256 volume;
        uint256 reservePrice;
        uint256 currentBid;
        address currentBidder;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool finalized;
    }
    
    // State variables
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256[]) public userAuctions;
    
    uint256 private _nextOrderId = 1;
    uint256 private _nextAuctionId = 1;
    
    // Events
    event OrderCreated(uint256 indexed orderId, address indexed trader, OrderType orderType, uint256 indexed tokenId, uint256 volume, uint256 pricePerUnit);
    event OrderFilled(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 volume, uint256 totalPrice);
    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 indexed tokenId, uint256 volume, uint256 reservePrice);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 bidAmount);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 finalPrice);
    event MarketFeeUpdated(uint256 newFeeBps);
    
    constructor(
        address _creditsContract,
        address _paymentToken,
        address _feeRecipient
    ) {
        creditsContract = GreenHydrogenCredits(_creditsContract);
        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a buy or sell order
     */
    function createOrder(
        OrderType orderType,
        uint256 tokenId,
        uint256 volume,
        uint256 pricePerUnit,
        uint256 expiresAt,
        bool partialFillAllowed
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(volume > 0, "Volume must be greater than 0");
        require(pricePerUnit > 0, "Price must be greater than 0");
        require(expiresAt > block.timestamp, "Expiry must be in future");
        
        // For sell orders, verify seller owns the credits
        if (orderType == OrderType.Sell) {
            require(creditsContract.balanceOf(msg.sender, tokenId) >= volume, "Insufficient credits");
            require(creditsContract.getTransferableBalance(msg.sender, tokenId) >= volume, "Insufficient transferable credits");
        }
        
        uint256 orderId = _nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            orderType: orderType,
            tokenId: tokenId,
            volume: volume,
            pricePerUnit: pricePerUnit,
            filledVolume: 0,
            status: OrderStatus.Active,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            partialFillAllowed: partialFillAllowed
        });
        
        userOrders[msg.sender].push(orderId);
        
        emit OrderCreated(orderId, msg.sender, orderType, tokenId, volume, pricePerUnit);
        
        // Try to match order immediately
        _matchOrder(orderId);
        
        return orderId;
    }
    
    /**
     * @dev Fill a specific order (market order)
     */
    function fillOrder(uint256 orderId, uint256 volume) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Active, "Order not active");
        require(order.trader != msg.sender, "Cannot fill own order");
        require(block.timestamp <= order.expiresAt, "Order expired");
        
        uint256 availableVolume = order.volume - order.filledVolume;
        require(volume <= availableVolume, "Volume exceeds available");
        
        if (!order.partialFillAllowed && volume != availableVolume) {
            revert("Partial fills not allowed");
        }
        
        uint256 totalPrice = volume * order.pricePerUnit;
        uint256 marketFee = (totalPrice * marketFeeBps) / 10000;
        uint256 sellerAmount = totalPrice - marketFee;
        
        if (order.orderType == OrderType.Sell) {
            // Buyer fills sell order
            require(paymentToken.transferFrom(msg.sender, order.trader, sellerAmount), "Payment failed");
            require(paymentToken.transferFrom(msg.sender, feeRecipient, marketFee), "Fee payment failed");
            
            creditsContract.safeTransferFrom(order.trader, msg.sender, order.tokenId, volume, "");
            
            emit OrderFilled(orderId, msg.sender, order.trader, volume, totalPrice);
        } else {
            // Seller fills buy order
            require(creditsContract.balanceOf(msg.sender, order.tokenId) >= volume, "Insufficient credits");
            require(creditsContract.getTransferableBalance(msg.sender, order.tokenId) >= volume, "Insufficient transferable credits");
            require(paymentToken.transferFrom(order.trader, msg.sender, sellerAmount), "Payment failed");
            require(paymentToken.transferFrom(order.trader, feeRecipient, marketFee), "Fee payment failed");
            
            creditsContract.safeTransferFrom(msg.sender, order.trader, order.tokenId, volume, "");
            
            emit OrderFilled(orderId, order.trader, msg.sender, volume, totalPrice);
        }
        
        order.filledVolume += volume;
        
        if (order.filledVolume == order.volume) {
            order.status = OrderStatus.Filled;
        }
    }
    
    /**
     * @dev Cancel an active order
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Not order owner");
        require(order.status == OrderStatus.Active, "Order not active");
        
        order.status = OrderStatus.Cancelled;
        emit OrderCancelled(orderId, msg.sender);
    }
    
    /**
     * @dev Create an auction for credits
     */
    function createAuction(
        uint256 tokenId,
        uint256 volume,
        uint256 reservePrice,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(volume > 0, "Volume must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(creditsContract.balanceOf(msg.sender, tokenId) >= volume, "Insufficient credits");
        require(creditsContract.getTransferableBalance(msg.sender, tokenId) >= volume, "Insufficient transferable credits");
        
        uint256 auctionId = _nextAuctionId++;
        
        auctions[auctionId] = Auction({
            auctionId: auctionId,
            seller: msg.sender,
            tokenId: tokenId,
            volume: volume,
            reservePrice: reservePrice,
            currentBid: 0,
            currentBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            active: true,
            finalized: false
        });
        
        userAuctions[msg.sender].push(auctionId);
        
        emit AuctionCreated(auctionId, msg.sender, tokenId, volume, reservePrice);
        return auctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 auctionId, uint256 bidAmount) external nonReentrant whenNotPaused {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp <= auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(bidAmount > auction.currentBid, "Bid must be higher than current bid");
        require(bidAmount >= auction.reservePrice, "Bid below reserve price");
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            require(paymentToken.transfer(auction.currentBidder, auction.currentBid), "Refund failed");
        }
        
        // Lock new bid amount
        require(paymentToken.transferFrom(msg.sender, address(this), bidAmount), "Bid payment failed");
        
        auction.currentBid = bidAmount;
        auction.currentBidder = msg.sender;
        
        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }
    
    /**
     * @dev Finalize an auction
     */
    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp > auction.endTime, "Auction not ended");
        require(!auction.finalized, "Auction already finalized");
        
        auction.active = false;
        auction.finalized = true;
        
        if (auction.currentBidder != address(0)) {
            // Successful auction
            uint256 marketFee = (auction.currentBid * marketFeeBps) / 10000;
            uint256 sellerAmount = auction.currentBid - marketFee;
            
            require(paymentToken.transfer(auction.seller, sellerAmount), "Payment to seller failed");
            require(paymentToken.transfer(feeRecipient, marketFee), "Fee payment failed");
            
            creditsContract.safeTransferFrom(auction.seller, auction.currentBidder, auction.tokenId, auction.volume, "");
            
            emit AuctionFinalized(auctionId, auction.currentBidder, auction.currentBid);
        } else {
            // No bids, auction failed
            emit AuctionFinalized(auctionId, address(0), 0);
        }
    }
    
    /**
     * @dev Get order information
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    /**
     * @dev Get auction information
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }
    
    /**
     * @dev Get user's orders
     */
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }
    
    /**
     * @dev Get user's auctions
     */
    function getUserAuctions(address user) external view returns (uint256[] memory) {
        return userAuctions[user];
    }
    
    /**
     * @dev Update market fee (only owner)
     */
    function updateMarketFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%"); // Max 10%
        marketFeeBps = newFeeBps;
        emit MarketFeeUpdated(newFeeBps);
    }
    
    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
    }
    
    /**
     * @dev Update payment token (only owner)
     */
    function updatePaymentToken(address newPaymentToken) external onlyOwner {
        require(newPaymentToken != address(0), "Invalid address");
        paymentToken = IERC20(newPaymentToken);
    }
    
    /**
     * @dev Internal function to match orders
     */
    function _matchOrder(uint256 orderId) internal {
        // Simple matching logic - could be expanded for more sophisticated matching
        Order storage newOrder = orders[orderId];
        
        // For now, just emit the order created event
        // In a full implementation, you would iterate through existing orders
        // to find matches and execute trades automatically
    }
    
    /**
     * @dev Pause the marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw function (only owner, when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
