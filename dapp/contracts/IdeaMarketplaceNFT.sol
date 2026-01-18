// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract IdeaMarketplaceNFT is ERC721 {
    uint256 private _tokenIdCounter;

    // Store idea metadata for each token
    struct IdeaMetadata {
        string title;
        string imageIPFS;
    }
    
    mapping(uint256 => IdeaMetadata) public ideaMetadata;

    constructor() ERC721("Idea Marketplace", "IDEA") {}

    function mint(string memory title, string memory imageIPFS) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        // Store metadata
        ideaMetadata[tokenId] = IdeaMetadata({
            title: title,
            imageIPFS: imageIPFS
        });
        
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");

        IdeaMetadata memory metadata = ideaMetadata[tokenId];
        string memory symbol = _generateSymbol(metadata.title);

        // Build JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', metadata.title, '",',
                        '"symbol": "', symbol, '",',
                        '"description": "Idea NFT from Marketplace",',
                        '"image": "', metadata.imageIPFS, '",',
                        '"attributes": [',
                            '{"trait_type": "Token ID", "value": "', Strings.toString(tokenId), '"}',
                        ']',
                        '}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Generate symbol from first letter of each word in title
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
}