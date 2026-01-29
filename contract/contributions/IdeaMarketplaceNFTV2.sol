// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IdeaMarketplaceNFTV2
 * @notice Decentralized marketplace for idea NFTs with trading, royalties, and voting
 * @dev Features:
 *      - ERC721 NFT minting with rich metadata
 *      - Secondary market trading with escrow
 *      - Creator royalties on sales
 *      - Community voting on featured ideas
 *      - Collection management
 *      - Idea ratings and reviews
 */
contract IdeaMarketplaceNFTV2 is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // =============================================================
    //                      CUSTOM ERRORS
    // =============================================================

    error TokenDoesNotExist();
    error NotTokenOwner();
    error InvalidPrice();
    error InsufficientFunds();
    error ListingDoesNotExist();
    error AlreadyListed();
    error NotListed();
    error InvalidRating();
    error AlreadyVoted();
    error InsufficientAllowance();

    // =============================================================
    //                       ENUMS & STRUCTS
    // =============================================================

    enum VoteStatus { Active, Approved, Rejected }

    struct IdeaMetadata {
        string title;
        string description;
        string imageIPFS;
        address creator;
        uint256 createdAt;
        uint256 royaltyPercentage;
        bool verified;
    }

    struct Listing {
        address seller;
        uint256 price;
        address paymentToken; // address(0) for ETH
        uint256 listedAt;
        bool active;
    }

    struct Vote {
        uint256 voteWeight;
        bool support;
        uint256 timestamp;
    }

    struct IdeaVote {
        uint256 totalVotes;
        uint256 supportVotes;
        VoteStatus status;
        uint256 createdAt;
    }

    struct Review {
        address reviewer;
        uint8 rating;
        string comment;
        uint256 timestamp;
    }

    // =============================================================
    //                         STORAGE
    // =============================================================

    uint256 private _tokenIdCounter;

    mapping(uint256 => IdeaMetadata) public ideaMetadata;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => IdeaVote) public ideaVotes;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => Review[]) public reviews;
    mapping(address => bool) public verifiedCreators;
    mapping(address => uint256) public creatorEarnings;
    mapping(uint256 => uint256) public royaltyEarnings;

    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    uint256 public votingThreshold = 100; // votes needed for approval
    address public treasury;
    address public votingToken;

    // =============================================================
    //                        EVENTS
    // =============================================================

    event IdeaMinted(uint256 indexed tokenId, address indexed creator, string title);
    event IdeaListed(uint256 indexed tokenId, address indexed seller, uint256 price, address token);
    event IdeaDelisted(uint256 indexed tokenId, address indexed seller);
    event IdeasSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event IdeaVoted(uint256 indexed tokenId, address indexed voter, bool support);
    event ReviewSubmitted(uint256 indexed tokenId, address indexed reviewer, uint8 rating);
    event CreatorVerified(address indexed creator);
    event PlatformFeeUpdated(uint256 newFee);

    // =============================================================
    //                       CONSTRUCTOR
    // =============================================================

    constructor(address _votingToken, address _treasury) ERC721("Idea Marketplace", "IDEA") Ownable(msg.sender) {
        votingToken = _votingToken;
        treasury = _treasury;
    }

    // =============================================================
    //                     MINTING & METADATA
    // =============================================================

    function mint(
        string memory title,
        string memory description,
        string memory imageIPFS,
        uint256 royaltyPercentage
    ) external returns (uint256) {
        if (royaltyPercentage > 10000) revert InvalidPrice(); // Max 100%
        if (bytes(title).length == 0 || bytes(imageIPFS).length == 0) revert InvalidPrice();

        uint256 tokenId = _tokenIdCounter++;

        ideaMetadata[tokenId] = IdeaMetadata({
            title: title,
            description: description,
            imageIPFS: imageIPFS,
            creator: msg.sender,
            createdAt: block.timestamp,
            royaltyPercentage: royaltyPercentage,
            verified: verifiedCreators[msg.sender]
        });

        _safeMint(msg.sender, tokenId);

        emit IdeaMinted(tokenId, msg.sender, title);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        IdeaMetadata memory metadata = ideaMetadata[tokenId];
        string memory symbol = _generateSymbol(metadata.title);
        uint256 currentRating = _calculateAverageRating(tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', metadata.title, '",',
                        '"description": "', metadata.description, '",',
                        '"symbol": "', symbol, '",',
                        '"image": "', metadata.imageIPFS, '",',
                        '"creator": "', Strings.toHexString(uint160(metadata.creator), 20), '",',
                        '"attributes": [',
                        '{"trait_type": "Token ID", "value": "', tokenId.toString(), '"},',
                        '{"trait_type": "Created At", "value": "', metadata.createdAt.toString(), '"},',
                        '{"trait_type": "Royalty %", "value": "', (metadata.royaltyPercentage / 100).toString(), '"},',
                        '{"trait_type": "Verified", "value": "', metadata.verified ? "true" : "false", '"},',
                        '{"trait_type": "Average Rating", "value": "', currentRating.toString(), '"}',
                        ']}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function _generateSymbol(string memory title) private pure returns (string memory) {
        bytes memory titleBytes = bytes(title);
        bytes memory symbolBytes = new bytes(10);
        uint256 symbolIndex = 0;
        bool isNewWord = true;

        for (uint256 i = 0; i < titleBytes.length && symbolIndex < 10; i++) {
            bytes1 char = titleBytes[i];

            if ((char >= 0x41 && char <= 0x5A) || (char >= 0x61 && char <= 0x7A)) {
                if (isNewWord) {
                    if (char >= 0x61 && char <= 0x7A) {
                        symbolBytes[symbolIndex] = bytes1(uint8(char) - 32);
                    } else {
                        symbolBytes[symbolIndex] = char;
                    }
                    symbolIndex++;
                    isNewWord = false;
                }
            } else if (char == 0x20) {
                isNewWord = true;
            }
        }

        bytes memory trimmedSymbol = new bytes(symbolIndex);
        for (uint256 i = 0; i < symbolIndex; i++) {
            trimmedSymbol[i] = symbolBytes[i];
        }

        return string(trimmedSymbol);
    }

    // =============================================================
    //                    MARKETPLACE LISTING
    // =============================================================

    function listIdea(uint256 tokenId, uint256 price, address paymentToken) external {
        if (_ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert InvalidPrice();
        if (listings[tokenId].active) revert AlreadyListed();

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            paymentToken: paymentToken,
            listedAt: block.timestamp,
            active: true
        });

        emit IdeaListed(tokenId, msg.sender, price, paymentToken);
    }

    function delistIdea(uint256 tokenId) external {
        if (listings[tokenId].seller != msg.sender) revert NotTokenOwner();
        if (!listings[tokenId].active) revert NotListed();

        listings[tokenId].active = false;

        emit IdeaDelisted(tokenId, msg.sender);
    }

    function buyIdea(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert NotListed();
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();

        address seller = listing.seller;
        uint256 price = listing.price;
        address paymentToken = listing.paymentToken;

        // Handle payment
        if (paymentToken == address(0)) {
            if (msg.value < price) revert InsufficientFunds();
        } else {
            IERC20 token = IERC20(paymentToken);
            if (token.allowance(msg.sender, address(this)) < price) revert InsufficientAllowance();
            token.transferFrom(msg.sender, address(this), price);
        }

        // Calculate fees
        uint256 platformFee = (price * platformFeePercentage) / 10000;
        uint256 creatorRoyalty = (price * ideaMetadata[tokenId].royaltyPercentage) / 10000;
        uint256 sellerAmount = price - platformFee - creatorRoyalty;

        // Transfer ownership
        listings[tokenId].active = false;
        _transfer(seller, msg.sender, tokenId);

        // Distribute funds
        _distributeFunds(paymentToken, seller, sellerAmount);
        _distributeFunds(paymentToken, treasury, platformFee);
        _distributeFunds(paymentToken, ideaMetadata[tokenId].creator, creatorRoyalty);

        creatorEarnings[ideaMetadata[tokenId].creator] += creatorRoyalty;
        royaltyEarnings[tokenId] += creatorRoyalty;

        emit IdeasSold(tokenId, seller, msg.sender, price);
        emit RoyaltyPaid(tokenId, ideaMetadata[tokenId].creator, creatorRoyalty);
    }

    function _distributeFunds(address token, address recipient, uint256 amount) internal {
        if (amount == 0) return;

        if (token == address(0)) {
            payable(recipient).transfer(amount);
        } else {
            IERC20(token).transfer(recipient, amount);
        }
    }

    // =============================================================
    //                      VOTING SYSTEM
    // =============================================================

    function voteOnIdea(uint256 tokenId, bool support, uint256 voteWeight) external {
        if (!_exists(tokenId)) revert TokenDoesNotExist();

        if (votingToken != address(0)) {
            IERC20 token = IERC20(votingToken);
            if (token.balanceOf(msg.sender) < voteWeight) revert InsufficientFunds();
            if (token.allowance(msg.sender, address(this)) < voteWeight) revert InsufficientAllowance();
            token.transferFrom(msg.sender, address(this), voteWeight);
        }

        if (votes[tokenId][msg.sender].timestamp != 0) revert AlreadyVoted();

        votes[tokenId][msg.sender] = Vote({
            voteWeight: voteWeight,
            support: support,
            timestamp: block.timestamp
        });

        if (ideaVotes[tokenId].createdAt == 0) {
            ideaVotes[tokenId] = IdeaVote({
                totalVotes: 0,
                supportVotes: 0,
                status: VoteStatus.Active,
                createdAt: block.timestamp
            });
        }

        ideaVotes[tokenId].totalVotes += voteWeight;
        if (support) {
            ideaVotes[tokenId].supportVotes += voteWeight;
        }

        if (ideaVotes[tokenId].supportVotes >= votingThreshold) {
            ideaVotes[tokenId].status = VoteStatus.Approved;
        }

        emit IdeaVoted(tokenId, msg.sender, support);
    }

    function getVoteStatus(uint256 tokenId) external view returns (IdeaVote memory) {
        return ideaVotes[tokenId];
    }

    // =============================================================
    //                     REVIEWS & RATINGS
    // =============================================================

    function submitReview(uint256 tokenId, uint8 rating, string memory comment) external {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        if (rating < 1 || rating > 5) revert InvalidRating();

        reviews[tokenId].push(Review({
            reviewer: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp
        }));

        emit ReviewSubmitted(tokenId, msg.sender, rating);
    }

    function getReviews(uint256 tokenId) external view returns (Review[] memory) {
        return reviews[tokenId];
    }

    function _calculateAverageRating(uint256 tokenId) internal view returns (uint256) {
        Review[] memory ideaReviews = reviews[tokenId];
        if (ideaReviews.length == 0) return 0;

        uint256 totalRating = 0;
        for (uint256 i = 0; i < ideaReviews.length; i++) {
            totalRating += ideaReviews[i].rating;
        }

        return totalRating / ideaReviews.length;
    }

    // =============================================================
    //                   CREATOR MANAGEMENT
    // =============================================================

    function verifyCreator(address creator) external onlyOwner {
        verifiedCreators[creator] = true;
        emit CreatorVerified(creator);
    }

    function unverifyCreator(address creator) external onlyOwner {
        verifiedCreators[creator] = false;
    }

    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }

    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================

    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 1000) revert InvalidPrice(); // Max 10%
        platformFeePercentage = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function setVotingThreshold(uint256 threshold) external onlyOwner {
        votingThreshold = threshold;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidPrice();
        treasury = newTreasury;
    }

    function setVotingToken(address newToken) external onlyOwner {
        votingToken = newToken;
    }

    function withdrawVotingTokens(uint256 amount) external onlyOwner {
        if (votingToken != address(0)) {
            IERC20(votingToken).transfer(owner(), amount);
        }
    }

    // =============================================================
    //                    ENUMERABLE OVERRIDES
    // =============================================================

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}