// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SimpleGreenHydrogenCredits
 * @dev Simple ERC-721 contract for Green Hydrogen Credits - Hackathon Version
 * Each token represents a credit for a specific volume of green hydrogen
 */
contract SimpleGreenHydrogenCredits is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Credit information
    struct Credit {
        uint256 tokenId;
        address producer;
        uint256 volume; // kg of hydrogen
        bool retired;
        uint256 issuedAt;
        string metadataURI;
    }
    
    // Mapping from token ID to credit info
    mapping(uint256 => Credit) public credits;
    
    // Mapping from user to their issued credits
    mapping(address => uint256[]) public userCredits;
    
    // Events
    event CreditIssued(uint256 indexed tokenId, address indexed producer, uint256 volume);
    event CreditTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event CreditRetired(uint256 indexed tokenId, address indexed owner, uint256 volume);
    
    constructor() ERC721("Green Hydrogen Credits", "GHC") {}
    
    /**
     * @dev Issue a new green hydrogen credit
     */
    function issueCredit(uint256 volume, string memory metadataURI) 
        external 
        returns (uint256) 
    {
        require(volume > 0, "Volume must be greater than 0");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint token to producer
        _mint(msg.sender, tokenId);
        
        // Store credit information
        credits[tokenId] = Credit({
            tokenId: tokenId,
            producer: msg.sender,
            volume: volume,
            retired: false,
            issuedAt: block.timestamp,
            metadataURI: metadataURI
        });
        
        // Add to user's credits list
        userCredits[msg.sender].push(tokenId);
        
        emit CreditIssued(tokenId, msg.sender, volume);
        return tokenId;
    }
    
    /**
     * @dev Transfer credit to another address
     */
    function transferCredit(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner of credit");
        require(!credits[tokenId].retired, "Credit is retired");
        require(to != address(0), "Invalid recipient");
        
        // Update user credits lists
        _removeFromUserCredits(msg.sender, tokenId);
        userCredits[to].push(tokenId);
        
        // Transfer the token
        _transfer(msg.sender, to, tokenId);
        
        emit CreditTransferred(tokenId, msg.sender, to);
    }
    
    /**
     * @dev Retire a credit (prevents double counting)
     */
    function retireCredit(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner of credit");
        require(!credits[tokenId].retired, "Credit already retired");
        
        // Mark as retired
        credits[tokenId].retired = true;
        
        emit CreditRetired(tokenId, msg.sender, credits[tokenId].volume);
    }
    
    /**
     * @dev Get credit information
     */
    function getCreditInfo(uint256 tokenId) 
        external 
        view 
        returns (Credit memory) 
    {
        require(_exists(tokenId), "Credit does not exist");
        return credits[tokenId];
    }
    
    /**
     * @dev Get all credits owned by an address
     */
    function getUserCredits(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userCredits[user];
    }
    
    /**
     * @dev Get total number of credits issued
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Check if a credit is transferable (not retired)
     */
    function isTransferable(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Credit does not exist");
        return !credits[tokenId].retired;
    }
    
    /**
     * @dev Internal function to remove token from user's credits array
     */
    function _removeFromUserCredits(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = userCredits[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Override tokenURI to use stored metadata
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Credit does not exist");
        return credits[tokenId].metadataURI;
    }
}
