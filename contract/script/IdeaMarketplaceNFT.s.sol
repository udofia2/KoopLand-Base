// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/IdeaMarketplaceNFT.sol";

contract DeployIdeaMarketplaceNFT is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        IdeaMarketplaceNFT nft = new IdeaMarketplaceNFT();
        
        vm.stopBroadcast();
    }
}