// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GreenHydrogenCredits
 * @dev ERC-1155 based smart contract for green hydrogen credits
 * Supports multiple credit types, verification, transfers, and retirement
 */
contract GreenHydrogenCredits is ERC1155, AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Role definitions
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant REGULATORY_ROLE = keccak256("REGULATORY_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // Credit status enumeration
    enum CreditStatus { Pending, Verified, Issued, Transferred, Retired }
    
    // Production method enumeration
    enum ProductionMethod { Electrolysis, BiogasReforming, Thermochemical }
    
    // Renewable source enumeration
    enum RenewableSource { Solar, Wind, Hydro, Geothermal, Biomass, Mixed }
    
    // Credit information structure
    struct CreditInfo {
        uint256 tokenId;
        address producer;
        uint256 volume; // in kg
        ProductionMethod productionMethod;
        RenewableSource renewableSource;
        uint256 productionFacilityId;
        CreditStatus status;
        address verifier;
        uint256 verificationDate;
        uint256 expiryDate;
        string metadataURI;
        bool exists;
    }
    
    // Facility information structure
    struct FacilityInfo {
        uint256 facilityId;
        address owner;
        string name;
        string location;
        uint256 capacityMW;
        RenewableSource[] renewableSources;
        bool certified;
        address certifyingBody;
        uint256 certificationDate;
        bool exists;
    }
    
    // Retirement information structure
    struct RetirementInfo {
        uint256 tokenId;
        uint256 volume;
        address retiredBy;
        uint256 retirementDate;
        string retirementReason;
        string complianceProject;
        string beneficiary;
        string certificateId;
    }
    
    // State variables
    mapping(uint256 => CreditInfo) public credits;
    mapping(uint256 => FacilityInfo) public facilities;
    mapping(uint256 => uint256) public retiredVolumes; // tokenId => retired volume
    mapping(uint256 => RetirementInfo[]) public retirements; // tokenId => retirement records
    mapping(address => uint256[]) public producerCredits; // producer => tokenIds
    mapping(address => uint256[]) public ownerCredits; // owner => tokenIds
    
    Counters.Counter private _facilityIdCounter;
    
    // Events
    event CreditIssued(uint256 indexed tokenId, address indexed producer, uint256 volume, uint256 facilityId);
    event CreditVerified(uint256 indexed tokenId, address indexed verifier, uint256 verificationDate);
    event CreditTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 volume);
    event CreditRetired(uint256 indexed tokenId, address indexed retiredBy, uint256 volume, string certificateId);
    event FacilityRegistered(uint256 indexed facilityId, address indexed owner, string name);
    event FacilityCertified(uint256 indexed facilityId, address indexed certifyingBody, uint256 certificationDate);
    
    constructor(string memory uri) ERC1155(uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(REGULATORY_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new production facility
     */
    function registerFacility(
        string memory name,
        string memory location,
        uint256 capacityMW,
        RenewableSource[] memory renewableSources
    ) external returns (uint256) {
        _facilityIdCounter.increment();
        uint256 facilityId = _facilityIdCounter.current();
        
        facilities[facilityId] = FacilityInfo({
            facilityId: facilityId,
            owner: msg.sender,
            name: name,
            location: location,
            capacityMW: capacityMW,
            renewableSources: renewableSources,
            certified: false,
            certifyingBody: address(0),
            certificationDate: 0,
            exists: true
        });
        
        emit FacilityRegistered(facilityId, msg.sender, name);
        return facilityId;
    }
    
    /**
     * @dev Certify a production facility (only by regulatory/auditor)
     */
    function certifyFacility(uint256 facilityId) 
        external 
        onlyRole(REGULATORY_ROLE) 
    {
        require(facilities[facilityId].exists, "Facility does not exist");
        
        facilities[facilityId].certified = true;
        facilities[facilityId].certifyingBody = msg.sender;
        facilities[facilityId].certificationDate = block.timestamp;
        
        emit FacilityCertified(facilityId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Issue new green hydrogen credits
     */
    function issueCredits(
        uint256 volume,
        ProductionMethod productionMethod,
        RenewableSource renewableSource,
        uint256 facilityId,
        uint256 expiryDate,
        string memory metadataURI
    ) external nonReentrant returns (uint256) {
        require(facilities[facilityId].exists, "Facility does not exist");
        require(facilities[facilityId].certified, "Facility not certified");
        require(facilities[facilityId].owner == msg.sender, "Not facility owner");
        require(volume > 0, "Volume must be greater than 0");
        require(expiryDate > block.timestamp, "Expiry date must be in future");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        credits[tokenId] = CreditInfo({
            tokenId: tokenId,
            producer: msg.sender,
            volume: volume,
            productionMethod: productionMethod,
            renewableSource: renewableSource,
            productionFacilityId: facilityId,
            status: CreditStatus.Pending,
            verifier: address(0),
            verificationDate: 0,
            expiryDate: expiryDate,
            metadataURI: metadataURI,
            exists: true
        });
        
        producerCredits[msg.sender].push(tokenId);
        ownerCredits[msg.sender].push(tokenId);
        
        // Mint tokens to producer
        _mint(msg.sender, tokenId, volume, "");
        
        emit CreditIssued(tokenId, msg.sender, volume, facilityId);
        return tokenId;
    }
    
    /**
     * @dev Verify green hydrogen credits
     */
    function verifyCredits(uint256 tokenId) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        require(credits[tokenId].exists, "Credit does not exist");
        require(credits[tokenId].status == CreditStatus.Pending, "Credit not in pending state");
        require(block.timestamp <= credits[tokenId].expiryDate, "Credit has expired");
        
        credits[tokenId].status = CreditStatus.Verified;
        credits[tokenId].verifier = msg.sender;
        credits[tokenId].verificationDate = block.timestamp;
        
        emit CreditVerified(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer credits between accounts
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override nonReentrant {
        require(credits[id].exists, "Credit does not exist");
        require(credits[id].status == CreditStatus.Verified || credits[id].status == CreditStatus.Issued, "Credit not transferable");
        require(block.timestamp <= credits[id].expiryDate, "Credit has expired");
        require(amount <= balanceOf(from, id) - retiredVolumes[id], "Insufficient transferable balance");
        
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Update ownership tracking
        if (balanceOf(from, id) == 0) {
            _removeFromOwnerCredits(from, id);
        }
        if (balanceOf(to, id) == amount) {
            ownerCredits[to].push(id);
        }
        
        credits[id].status = CreditStatus.Transferred;
        emit CreditTransferred(id, from, to, amount);
    }
    
    /**
     * @dev Retire credits to prevent double counting
     */
    function retireCredits(
        uint256 tokenId,
        uint256 volume,
        string memory retirementReason,
        string memory complianceProject,
        string memory beneficiary
    ) external nonReentrant {
        require(credits[tokenId].exists, "Credit does not exist");
        require(balanceOf(msg.sender, tokenId) >= volume, "Insufficient balance");
        require(retiredVolumes[tokenId] + volume <= credits[tokenId].volume, "Cannot retire more than total volume");
        require(block.timestamp <= credits[tokenId].expiryDate, "Credit has expired");
        
        string memory certificateId = string(abi.encodePacked(
            "RC_",
            Strings.toString(tokenId),
            "_",
            Strings.toString(block.timestamp),
            "_",
            Strings.toString(volume)
        ));
        
        retiredVolumes[tokenId] += volume;
        
        RetirementInfo memory retirement = RetirementInfo({
            tokenId: tokenId,
            volume: volume,
            retiredBy: msg.sender,
            retirementDate: block.timestamp,
            retirementReason: retirementReason,
            complianceProject: complianceProject,
            beneficiary: beneficiary,
            certificateId: certificateId
        });
        
        retirements[tokenId].push(retirement);
        
        // If all credits are retired, update status
        if (retiredVolumes[tokenId] == credits[tokenId].volume) {
            credits[tokenId].status = CreditStatus.Retired;
        }
        
        emit CreditRetired(tokenId, msg.sender, volume, certificateId);
    }
    
    /**
     * @dev Get credit information
     */
    function getCreditInfo(uint256 tokenId) external view returns (CreditInfo memory) {
        require(credits[tokenId].exists, "Credit does not exist");
        return credits[tokenId];
    }
    
    /**
     * @dev Get facility information
     */
    function getFacilityInfo(uint256 facilityId) external view returns (FacilityInfo memory) {
        require(facilities[facilityId].exists, "Facility does not exist");
        return facilities[facilityId];
    }
    
    /**
     * @dev Get retirement history for a credit
     */
    function getRetirementHistory(uint256 tokenId) external view returns (RetirementInfo[] memory) {
        return retirements[tokenId];
    }
    
    /**
     * @dev Get credits owned by an address
     */
    function getOwnerCredits(address owner) external view returns (uint256[] memory) {
        return ownerCredits[owner];
    }
    
    /**
     * @dev Get credits produced by an address
     */
    function getProducerCredits(address producer) external view returns (uint256[] memory) {
        return producerCredits[producer];
    }
    
    /**
     * @dev Get transferable balance (total balance minus retired volume)
     */
    function getTransferableBalance(address account, uint256 tokenId) external view returns (uint256) {
        uint256 totalBalance = balanceOf(account, tokenId);
        uint256 userRetiredVolume = 0;
        
        // Calculate user's share of retired volume
        if (totalBalance > 0 && credits[tokenId].volume > 0) {
            userRetiredVolume = (retiredVolumes[tokenId] * totalBalance) / credits[tokenId].volume;
        }
        
        return totalBalance > userRetiredVolume ? totalBalance - userRetiredVolume : 0;
    }
    
    /**
     * @dev Internal function to remove token from owner credits array
     */
    function _removeFromOwnerCredits(address owner, uint256 tokenId) internal {
        uint256[] storage credits = ownerCredits[owner];
        for (uint256 i = 0; i < credits.length; i++) {
            if (credits[i] == tokenId) {
                credits[i] = credits[credits.length - 1];
                credits.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Hook called before any token transfer
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
