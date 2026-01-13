// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PlankToken.sol";
import "../src/Relics.sol";

/**
 * @title Deploy
 * @notice Deployment script for Conquer Plank contracts on Mantle Sepolia
 *
 * Usage:
 *   # Dry run (simulation)
 *   forge script script/Deploy.s.sol --rpc-url mantle_sepolia
 *
 *   # Deploy
 *   forge script script/Deploy.s.sol --rpc-url mantle_sepolia --broadcast
 *
 *   # Deploy and verify
 *   forge script script/Deploy.s.sol --rpc-url mantle_sepolia --broadcast --verify
 *
 * Environment Variables Required:
 *   PRIVATE_KEY       - Deployer wallet private key
 *   ADMIN_ADDRESS     - Admin address for both contracts
 *   RELAYER_ADDRESS   - Backend relayer address (mints PLANK)
 *   SIGNER_ADDRESS    - Backend signer address (signs relic mints)
 *   BASE_URI          - Base URI for relic metadata (e.g., "ipfs://...")
 */
contract DeployScript is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address relayer = vm.envAddress("RELAYER_ADDRESS");
        address signerAddress = vm.envAddress("SIGNER_ADDRESS");
        string memory baseURI = vm.envString("BASE_URI");

        console.log("Deploying Conquer Plank contracts...");
        console.log("Admin:", admin);
        console.log("Relayer:", relayer);
        console.log("Signer:", signerAddress);
        console.log("Base URI:", baseURI);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy PlankToken
        PlankToken plankToken = new PlankToken(admin, relayer);
        console.log("PlankToken deployed at:", address(plankToken));

        // Deploy Relics
        Relics relics = new Relics(admin, signerAddress, baseURI);
        console.log("Relics deployed at:", address(relics));

        vm.stopBroadcast();

        // Log verification commands
        console.log("\n=== Verification Commands ===");
        console.log("PlankToken:");
        console.log(
            string(
                abi.encodePacked(
                    "forge verify-contract ",
                    vm.toString(address(plankToken)),
                    " PlankToken --chain mantle-sepolia --constructor-args $(cast abi-encode \"constructor(address,address)\" ",
                    vm.toString(admin),
                    " ",
                    vm.toString(relayer),
                    ")"
                )
            )
        );

        console.log("\nRelics:");
        console.log(
            string(
                abi.encodePacked(
                    "forge verify-contract ",
                    vm.toString(address(relics)),
                    " Relics --chain mantle-sepolia --constructor-args $(cast abi-encode \"constructor(address,address,string)\" ",
                    vm.toString(admin),
                    " ",
                    vm.toString(signerAddress),
                    " \"",
                    baseURI,
                    "\")"
                )
            )
        );

        // Output for .env file
        console.log("\n=== Add to .env ===");
        console.log(
            string(
                abi.encodePacked(
                    "VITE_PLANK_TOKEN_ADDRESS=",
                    vm.toString(address(plankToken))
                )
            )
        );
        console.log(
            string(
                abi.encodePacked(
                    "VITE_RELICS_ADDRESS=",
                    vm.toString(address(relics))
                )
            )
        );
    }
}

/**
 * @title DeployLocal
 * @notice Local deployment for testing with Anvil
 *
 * Usage:
 *   anvil
 *   forge script script/Deploy.s.sol:DeployLocalScript --rpc-url http://localhost:8545 --broadcast
 */
contract DeployLocalScript is Script {
    function run() external {
        // Use Anvil's default test accounts
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address admin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        address relayer = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        address signerAddress = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        string memory baseURI = "https://api.conquerplank.app/metadata/";

        console.log("Deploying to local Anvil...");

        vm.startBroadcast(deployerPrivateKey);

        PlankToken plankToken = new PlankToken(admin, relayer);
        console.log("PlankToken:", address(plankToken));

        Relics relics = new Relics(admin, signerAddress, baseURI);
        console.log("Relics:", address(relics));

        vm.stopBroadcast();
    }
}
