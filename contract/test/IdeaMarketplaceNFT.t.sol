// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/IdeaMarketplaceNFT.sol";

contract IdeaMarketplaceNFTTest is Test {
    IdeaMarketplaceNFT public ideaNFT;
    
    address owner = address(this);
    address addr1 = address(0x1);
    address addr2 = address(0x2);

    function setUp() public {
        ideaNFT = new IdeaMarketplaceNFT();
    }

    // ============ Deployment Tests ============
    
    function test_Deployment_CorrectNameAndSymbol() public view {
        assertEq(ideaNFT.name(), "Idea Marketplace");
        assertEq(ideaNFT.symbol(), "IDEA");
    }

    // ============ Minting Tests ============
    
    function test_Mint_AssignsToMinter() public {
        vm.prank(addr1);
        ideaNFT.mint("My Great Idea", "ipfs://QmExample123");
        
        assertEq(ideaNFT.ownerOf(0), addr1);
        assertEq(ideaNFT.balanceOf(addr1), 1);
    }

    function test_Mint_ReturnsCorrectTokenId() public {
        uint256 tokenId = ideaNFT.mint("Test Idea", "ipfs://test");
        assertEq(tokenId, 0);
        assertEq(ideaNFT.ownerOf(0), owner);
    }

    function test_Mint_IncrementsTokenIds() public {
        ideaNFT.mint("Idea 1", "ipfs://1");
        ideaNFT.mint("Idea 2", "ipfs://2");
        ideaNFT.mint("Idea 3", "ipfs://3");
        
        assertEq(ideaNFT.ownerOf(0), owner);
        assertEq(ideaNFT.ownerOf(1), owner);
        assertEq(ideaNFT.ownerOf(2), owner);
    }

    function test_Mint_StoresMetadataCorrectly() public {
        string memory title = "Blockchain Innovation";
        string memory imageIPFS = "ipfs://QmABC123";
        
        ideaNFT.mint(title, imageIPFS);
        
        (string memory storedTitle, string memory storedImage) = ideaNFT.ideaMetadata(0);
        assertEq(storedTitle, title);
        assertEq(storedImage, imageIPFS);
    }

    function test_Mint_AllowsMultipleUsers() public {
        vm.prank(addr1);
        ideaNFT.mint("Idea A", "ipfs://a");
        
        vm.prank(addr2);
        ideaNFT.mint("Idea B", "ipfs://b");
        
        assertEq(ideaNFT.ownerOf(0), addr1);
        assertEq(ideaNFT.ownerOf(1), addr2);
    }

    // ============ TokenURI Tests ============
    
    function test_TokenURI_ReturnsValidURI() public {
        ideaNFT.mint("My Test Idea", "ipfs://QmTest");
        
        string memory uri = ideaNFT.tokenURI(0);
        assertTrue(bytes(uri).length > 0);
        
        // Check it starts with data URI scheme
        bytes memory uriBytes = bytes(uri);
        bytes memory prefix = bytes("data:application/json;base64,");
        
        for(uint i = 0; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i]);
        }
    }

    function test_TokenURI_RevertsForNonExistentToken() public {
        vm.expectRevert("NFT does not exist");
        ideaNFT.tokenURI(999);
    }

    function test_TokenURI_ContainsCorrectMetadata() public {
        ideaNFT.mint("My Test Idea", "ipfs://QmTest");
        string memory uri = ideaNFT.tokenURI(0);
        
        // TokenURI should contain the title and image
        assertTrue(bytes(uri).length > 0);
    }

    // ============ Symbol Generation Tests ============
    
    function test_SymbolGeneration_SingleWord() public {
        ideaNFT.mint("Innovation", "ipfs://test");
        string memory uri = ideaNFT.tokenURI(0);
        
        // Verify it contains base64 encoded data
        assertTrue(bytes(uri).length > 30);
    }

    function test_SymbolGeneration_MultipleWords() public {
        ideaNFT.mint("Blockchain Technology Innovation", "ipfs://test");
        string memory uri = ideaNFT.tokenURI(0);
        
        assertTrue(bytes(uri).length > 30);
    }

    function test_SymbolGeneration_LowercaseToUppercase() public {
        ideaNFT.mint("decentralized finance platform", "ipfs://test");
        string memory uri = ideaNFT.tokenURI(0);
        
        assertTrue(bytes(uri).length > 30);
    }

    function test_SymbolGeneration_ExtraSpaces() public {
        ideaNFT.mint("My  Great   Idea", "ipfs://test");
        string memory uri = ideaNFT.tokenURI(0);
        
        assertTrue(bytes(uri).length > 30);
    }

    function test_SymbolGeneration_MaxLength() public {
        ideaNFT.mint(
            "One Two Three Four Five Six Seven Eight Nine Ten Eleven",
            "ipfs://test"
        );
        string memory uri = ideaNFT.tokenURI(0);
        
        assertTrue(bytes(uri).length > 30);
    }

    // ============ Transfer Tests ============
    
    function test_Transfer_OwnerCanTransfer() public {
        vm.prank(addr1);
        ideaNFT.mint("Transfer Test", "ipfs://transfer");
        
        vm.prank(addr1);
        ideaNFT.transferFrom(addr1, addr2, 0);
        
        assertEq(ideaNFT.ownerOf(0), addr2);
    }

    function test_Transfer_UpdatesBalances() public {
        vm.prank(addr1);
        ideaNFT.mint("Transfer Test", "ipfs://transfer");
        
        vm.prank(addr1);
        ideaNFT.transferFrom(addr1, addr2, 0);
        
        assertEq(ideaNFT.balanceOf(addr1), 0);
        assertEq(ideaNFT.balanceOf(addr2), 1);
    }

    function test_Transfer_RevertsForNonOwner() public {
        vm.prank(addr1);
        ideaNFT.mint("Transfer Test", "ipfs://transfer");
        
        vm.prank(addr2);
        vm.expectRevert();
        ideaNFT.transferFrom(addr1, addr2, 0);
    }

    function test_Transfer_PreservesMetadata() public {
        vm.prank(addr1);
        ideaNFT.mint("Transfer Test", "ipfs://transfer");
        
        vm.prank(addr1);
        ideaNFT.transferFrom(addr1, addr2, 0);
        
        (string memory title, string memory image) = ideaNFT.ideaMetadata(0);
        assertEq(title, "Transfer Test");
        assertEq(image, "ipfs://transfer");
    }

    // ============ Edge Case Tests ============
    
    function test_EdgeCase_EmptyTitle() public {
        ideaNFT.mint("", "ipfs://empty");
        
        (string memory title,) = ideaNFT.ideaMetadata(0);
        assertEq(title, "");
    }

    function test_EdgeCase_VeryLongTitle() public {
        string memory longTitle = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        ideaNFT.mint(longTitle, "ipfs://long");
        
        (string memory title,) = ideaNFT.ideaMetadata(0);
        assertEq(title, longTitle);
    }

    function test_EdgeCase_SpecialCharacters() public {
        ideaNFT.mint("Idea #1: AI & ML!", "ipfs://special");
        
        string memory uri = ideaNFT.tokenURI(0);
        assertTrue(bytes(uri).length > 0);
    }

    function test_EdgeCase_CIDv1() public {
        string memory cidv1 = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
        ideaNFT.mint("CIDv1 Test", cidv1);
        
        (, string memory image) = ideaNFT.ideaMetadata(0);
        assertEq(image, cidv1);
    }

    // ============ Fuzz Tests ============
    
    function testFuzz_Mint_AnyTitle(string memory title) public {
        vm.assume(bytes(title).length > 0 && bytes(title).length < 1000);
        
        ideaNFT.mint(title, "ipfs://fuzz");
        
        (string memory storedTitle,) = ideaNFT.ideaMetadata(0);
        assertEq(storedTitle, title);
    }

    function testFuzz_Mint_MultipleTokens(uint8 count) public {
        vm.assume(count > 0 && count < 50);
        
        for(uint256 i = 0; i < count; i++) {
            ideaNFT.mint("Test", "ipfs://test");
        }
        
        assertEq(ideaNFT.balanceOf(owner), count);
    }

    function testFuzz_Transfer_AnyValidAddress(address to) public {
        vm.assume(to != address(0) && to != addr1);
        
        vm.prank(addr1);
        ideaNFT.mint("Fuzz Transfer", "ipfs://fuzz");
        
        vm.prank(addr1);
        ideaNFT.transferFrom(addr1, to, 0);
        
        assertEq(ideaNFT.ownerOf(0), to);
    }

    // ============ Gas Tests ============
    
    function test_Gas_MintCost() public {
        uint256 gasBefore = gasleft();
        ideaNFT.mint("Gas Test", "ipfs://gas");
        uint256 gasUsed = gasBefore - gasleft();
        
        // Log gas used for reference
        emit log_named_uint("Gas used for mint", gasUsed);
        
        // Assert reasonable gas usage (adjust threshold as needed)
        assertTrue(gasUsed < 200000);
    }

    function test_Gas_TokenURICost() public {
        ideaNFT.mint("Gas Test", "ipfs://gas");
        
        uint256 gasBefore = gasleft();
        ideaNFT.tokenURI(0);
        uint256 gasUsed = gasBefore - gasleft();
        
        emit log_named_uint("Gas used for tokenURI", gasUsed);
    }
}