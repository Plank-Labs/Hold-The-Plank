// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Relics.sol";

contract RelicsTest is Test {
    Relics public relics;

    address public owner;
    uint256 public signerPrivateKey;
    address public signerAddress;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    string public constant BASE_URI = "https://api.conquerplank.app/metadata/";

    event RelicMinted(address indexed to, uint256 indexed tokenId, uint256 nonce);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event BaseURIUpdated(string newURI);

    function setUp() public {
        owner = makeAddr("owner");

        // Generate signer key pair
        signerPrivateKey = 0xA11CE;
        signerAddress = vm.addr(signerPrivateKey);

        relics = new Relics(owner, signerAddress, BASE_URI);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(relics.name(), "Conquer Plank Relics");
        assertEq(relics.symbol(), "RELIC");
        assertEq(relics.signer(), signerAddress);
        assertEq(relics.owner(), owner);

        // Check token requirements
        assertEq(relics.tokenRequirements(1), 60);
        assertEq(relics.tokenRequirements(2), 600);
        assertEq(relics.tokenRequirements(3), 3600);
        assertEq(relics.tokenRequirements(4), 36000);
        assertEq(relics.tokenRequirements(5), 360000);

        // Check token names
        assertEq(relics.tokenNames(1), "Bronze Shield");
        assertEq(relics.tokenNames(2), "Silver Helmet");
        assertEq(relics.tokenNames(3), "Gold Sword");
        assertEq(relics.tokenNames(4), "Diamond Crown");
        assertEq(relics.tokenNames(5), "Kronos Slayer");
    }

    function test_Constructor_RevertsZeroSigner() public {
        vm.expectRevert(Relics.ZeroAddress.selector);
        new Relics(owner, address(0), BASE_URI);
    }

    // ============ Signature Helpers ============

    function _createSignature(
        address user,
        uint256 tokenId,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 messageHash = relics.getMessageHash(user, tokenId, nonce, deadline);
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    // ============ Mint With Signature Tests ============

    function test_MintWithSignature() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = relics.nonces(user1);

        bytes memory signature = _createSignature(user1, tokenId, nonce, deadline);

        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RelicMinted(user1, tokenId, nonce);
        relics.mintWithSignature(tokenId, deadline, signature);

        assertEq(relics.balanceOf(user1, tokenId), 1);
        assertTrue(relics.hasClaimed(user1, tokenId));
        assertEq(relics.nonces(user1), nonce + 1);
    }

    function test_MintWithSignature_AllTokens() public {
        for (uint256 tokenId = 1; tokenId <= 5; tokenId++) {
            uint256 deadline = block.timestamp + 1 hours;
            uint256 nonce = relics.nonces(user1);

            bytes memory signature = _createSignature(user1, tokenId, nonce, deadline);

            vm.prank(user1);
            relics.mintWithSignature(tokenId, deadline, signature);

            assertEq(relics.balanceOf(user1, tokenId), 1);
            assertTrue(relics.hasClaimed(user1, tokenId));
        }

        // Verify all claimed
        bool[5] memory claimed = relics.getClaimedRelics(user1);
        for (uint256 i = 0; i < 5; i++) {
            assertTrue(claimed[i]);
        }
    }

    function test_MintWithSignature_RevertsInvalidTokenId_Zero() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _createSignature(user1, 0, 0, deadline);

        vm.prank(user1);
        vm.expectRevert(Relics.InvalidTokenId.selector);
        relics.mintWithSignature(0, deadline, signature);
    }

    function test_MintWithSignature_RevertsInvalidTokenId_Six() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _createSignature(user1, 6, 0, deadline);

        vm.prank(user1);
        vm.expectRevert(Relics.InvalidTokenId.selector);
        relics.mintWithSignature(6, deadline, signature);
    }

    function test_MintWithSignature_RevertsAlreadyClaimed() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        // First mint
        bytes memory sig1 = _createSignature(user1, tokenId, 0, deadline);
        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, sig1);

        // Second attempt
        bytes memory sig2 = _createSignature(user1, tokenId, 1, deadline);
        vm.prank(user1);
        vm.expectRevert(Relics.AlreadyClaimed.selector);
        relics.mintWithSignature(tokenId, deadline, sig2);
    }

    function test_MintWithSignature_RevertsExpiredSignature() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp - 1; // Already expired

        bytes memory signature = _createSignature(user1, tokenId, 0, deadline);

        vm.prank(user1);
        vm.expectRevert(Relics.SignatureExpired.selector);
        relics.mintWithSignature(tokenId, deadline, signature);
    }

    function test_MintWithSignature_RevertsInvalidSignature() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        // Sign for user1 but try to mint as user2
        bytes memory signature = _createSignature(user1, tokenId, 0, deadline);

        vm.prank(user2);
        vm.expectRevert(Relics.InvalidSignature.selector);
        relics.mintWithSignature(tokenId, deadline, signature);
    }

    function test_MintWithSignature_RevertsWrongNonce() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        // First mint to increment nonce
        bytes memory sig1 = _createSignature(user1, tokenId, 0, deadline);
        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, sig1);

        // Try to use old nonce for different token
        uint256 tokenId2 = 2;
        bytes memory sig2 = _createSignature(user1, tokenId2, 0, deadline); // Wrong nonce

        vm.prank(user1);
        vm.expectRevert(Relics.InvalidSignature.selector);
        relics.mintWithSignature(tokenId2, deadline, sig2);
    }

    function test_MintWithSignature_DifferentUsersCanClaimSameToken() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        // User1 mints
        bytes memory sig1 = _createSignature(user1, tokenId, 0, deadline);
        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, sig1);

        // User2 mints same token
        bytes memory sig2 = _createSignature(user2, tokenId, 0, deadline);
        vm.prank(user2);
        relics.mintWithSignature(tokenId, deadline, sig2);

        assertEq(relics.balanceOf(user1, tokenId), 1);
        assertEq(relics.balanceOf(user2, tokenId), 1);
    }

    // ============ Owner Functions Tests ============

    function test_SetSigner() public {
        address newSigner = makeAddr("newSigner");

        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit SignerUpdated(signerAddress, newSigner);
        relics.setSigner(newSigner);

        assertEq(relics.signer(), newSigner);
    }

    function test_SetSigner_RevertsNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        relics.setSigner(makeAddr("newSigner"));
    }

    function test_SetSigner_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Relics.ZeroAddress.selector);
        relics.setSigner(address(0));
    }

    function test_SetURI() public {
        string memory newURI = "https://new.uri.com/";

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit BaseURIUpdated(newURI);
        relics.setURI(newURI);
    }

    function test_SetURI_RevertsNotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        relics.setURI("https://new.uri.com/");
    }

    // ============ View Functions Tests ============

    function test_URI() public view {
        assertEq(relics.uri(1), string(abi.encodePacked(BASE_URI, "1.json")));
        assertEq(relics.uri(5), string(abi.encodePacked(BASE_URI, "5.json")));
    }

    function test_URI_RevertsInvalidTokenId() public {
        vm.expectRevert(Relics.InvalidTokenId.selector);
        relics.uri(0);

        vm.expectRevert(Relics.InvalidTokenId.selector);
        relics.uri(6);
    }

    function test_GetClaimedRelics() public {
        // Claim tokens 1 and 3
        bytes memory sig1 = _createSignature(user1, 1, 0, block.timestamp + 1 hours);
        vm.prank(user1);
        relics.mintWithSignature(1, block.timestamp + 1 hours, sig1);

        bytes memory sig3 = _createSignature(user1, 3, 1, block.timestamp + 1 hours);
        vm.prank(user1);
        relics.mintWithSignature(3, block.timestamp + 1 hours, sig3);

        bool[5] memory claimed = relics.getClaimedRelics(user1);
        assertTrue(claimed[0]);  // Token 1
        assertFalse(claimed[1]); // Token 2
        assertTrue(claimed[2]);  // Token 3
        assertFalse(claimed[3]); // Token 4
        assertFalse(claimed[4]); // Token 5
    }

    function test_GetRelicBalances() public {
        // Claim token 1
        bytes memory sig = _createSignature(user1, 1, 0, block.timestamp + 1 hours);
        vm.prank(user1);
        relics.mintWithSignature(1, block.timestamp + 1 hours, sig);

        uint256[5] memory balances = relics.getRelicBalances(user1);
        assertEq(balances[0], 1); // Token 1
        assertEq(balances[1], 0); // Token 2
        assertEq(balances[2], 0); // Token 3
        assertEq(balances[3], 0); // Token 4
        assertEq(balances[4], 0); // Token 5
    }

    function test_GetMessageHash() public view {
        address user = user1;
        uint256 tokenId = 1;
        uint256 nonce = 0;
        uint256 deadline = 12345;

        bytes32 expectedHash = keccak256(
            abi.encodePacked(user, tokenId, nonce, deadline, block.chainid, address(relics))
        );

        assertEq(relics.getMessageHash(user, tokenId, nonce, deadline), expectedHash);
    }

    // ============ Replay Protection Tests ============

    function test_ReplayProtection_SameSignatureFails() public {
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _createSignature(user1, tokenId, 0, deadline);

        // First mint succeeds
        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, signature);

        // Replay fails (nonce incremented + already claimed)
        vm.prank(user1);
        vm.expectRevert(Relics.AlreadyClaimed.selector);
        relics.mintWithSignature(tokenId, deadline, signature);
    }

    function test_ReplayProtection_CrossChainPrevented() public {
        // This test verifies that chainid is included in signature
        // In production, same signature won't work on different chain
        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + 1 hours;

        // Get the message hash which includes chainid
        bytes32 messageHash = relics.getMessageHash(user1, tokenId, 0, deadline);

        // Verify chainid is part of the hash
        bytes32 expectedHash = keccak256(
            abi.encodePacked(user1, tokenId, uint256(0), deadline, block.chainid, address(relics))
        );

        assertEq(messageHash, expectedHash);
    }

    // ============ Fuzz Tests ============

    function testFuzz_MintWithSignature_TokenId(uint256 tokenId) public {
        tokenId = bound(tokenId, 1, 5);

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _createSignature(user1, tokenId, 0, deadline);

        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, signature);

        assertEq(relics.balanceOf(user1, tokenId), 1);
    }

    function testFuzz_MintWithSignature_Deadline(uint256 futureTime) public {
        futureTime = bound(futureTime, 1, 365 days);

        uint256 tokenId = 1;
        uint256 deadline = block.timestamp + futureTime;
        bytes memory signature = _createSignature(user1, tokenId, 0, deadline);

        vm.prank(user1);
        relics.mintWithSignature(tokenId, deadline, signature);

        assertEq(relics.balanceOf(user1, tokenId), 1);
    }
}
