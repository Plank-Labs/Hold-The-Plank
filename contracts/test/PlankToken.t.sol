// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PlankToken.sol";

contract PlankTokenTest is Test {
    PlankToken public token;

    address public admin = makeAddr("admin");
    address public relayer = makeAddr("relayer");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public unauthorized = makeAddr("unauthorized");

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SESSION_REWARD = keccak256("SESSION_REWARD");
    bytes32 public constant GYM_BONUS = keccak256("GYM_BONUS");

    event PlankMinted(address indexed to, uint256 amount, bytes32 indexed reason);
    event BatchMinted(address[] recipients, uint256[] amounts, bytes32 indexed reason, uint256 totalAmount);

    function setUp() public {
        token = new PlankToken(admin, relayer);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(token.name(), "Plank Token");
        assertEq(token.symbol(), "PLANK");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
        assertEq(token.MAX_SUPPLY(), 1_000_000_000 * 10**18);
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(token.hasRole(MINTER_ROLE, relayer));
    }

    function test_Constructor_RevertsOnZeroAdmin() public {
        vm.expectRevert(PlankToken.ZeroAddress.selector);
        new PlankToken(address(0), relayer);
    }

    function test_Constructor_RevertsOnZeroRelayer() public {
        vm.expectRevert(PlankToken.ZeroAddress.selector);
        new PlankToken(admin, address(0));
    }

    // ============ Mint Tests ============

    function test_Mint() public {
        uint256 amount = 100 * 10**18;

        vm.prank(relayer);
        vm.expectEmit(true, false, true, true);
        emit PlankMinted(user1, amount, SESSION_REWARD);
        token.mint(user1, amount, SESSION_REWARD);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalMinted(user1), amount);
        assertEq(token.totalMintedByReason(SESSION_REWARD), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_Mint_RevertsUnauthorized() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        token.mint(user1, 100 * 10**18, SESSION_REWARD);
    }

    function test_Mint_RevertsZeroAddress() public {
        vm.prank(relayer);
        vm.expectRevert(PlankToken.ZeroAddress.selector);
        token.mint(address(0), 100 * 10**18, SESSION_REWARD);
    }

    function test_Mint_RevertsZeroAmount() public {
        vm.prank(relayer);
        vm.expectRevert(PlankToken.ZeroAmount.selector);
        token.mint(user1, 0, SESSION_REWARD);
    }

    function test_Mint_RevertsMaxSupplyExceeded() public {
        vm.startPrank(relayer);

        // First mint most of supply
        token.mint(user1, token.MAX_SUPPLY() - 100, SESSION_REWARD);

        // Try to mint more than remaining
        vm.expectRevert(PlankToken.MaxSupplyExceeded.selector);
        token.mint(user1, 101, SESSION_REWARD);

        vm.stopPrank();
    }

    // ============ Batch Mint Tests ============

    function test_MintBatch() public {
        address[] memory recipients = new address[](3);
        recipients[0] = user1;
        recipients[1] = user2;
        recipients[2] = makeAddr("user3");

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 50 * 10**18;
        amounts[1] = 100 * 10**18;
        amounts[2] = 150 * 10**18;

        uint256 totalAmount = 300 * 10**18;

        vm.prank(relayer);
        vm.expectEmit(false, false, true, true);
        emit BatchMinted(recipients, amounts, SESSION_REWARD, totalAmount);
        token.mintBatch(recipients, amounts, SESSION_REWARD);

        assertEq(token.balanceOf(user1), 50 * 10**18);
        assertEq(token.balanceOf(user2), 100 * 10**18);
        assertEq(token.balanceOf(recipients[2]), 150 * 10**18);
        assertEq(token.totalSupply(), totalAmount);
        assertEq(token.totalMintedByReason(SESSION_REWARD), totalAmount);
    }

    function test_MintBatch_RevertsArrayMismatch() public {
        address[] memory recipients = new address[](2);
        recipients[0] = user1;
        recipients[1] = user2;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 50 * 10**18;
        amounts[1] = 100 * 10**18;
        amounts[2] = 150 * 10**18;

        vm.prank(relayer);
        vm.expectRevert(PlankToken.ArrayLengthMismatch.selector);
        token.mintBatch(recipients, amounts, SESSION_REWARD);
    }

    function test_MintBatch_RevertsMaxSupply() public {
        address[] memory recipients = new address[](2);
        recipients[0] = user1;
        recipients[1] = user2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = token.MAX_SUPPLY() / 2 + 1;
        amounts[1] = token.MAX_SUPPLY() / 2 + 1;

        vm.prank(relayer);
        vm.expectRevert(PlankToken.MaxSupplyExceeded.selector);
        token.mintBatch(recipients, amounts, SESSION_REWARD);
    }

    function test_MintBatch_RevertsZeroAddress() public {
        address[] memory recipients = new address[](2);
        recipients[0] = user1;
        recipients[1] = address(0);

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 50 * 10**18;
        amounts[1] = 100 * 10**18;

        vm.prank(relayer);
        vm.expectRevert(PlankToken.ZeroAddress.selector);
        token.mintBatch(recipients, amounts, SESSION_REWARD);
    }

    // ============ Role Management Tests ============

    function test_AdminCanGrantMinterRole() public {
        address newMinter = makeAddr("newMinter");

        vm.prank(admin);
        token.grantRole(MINTER_ROLE, newMinter);

        assertTrue(token.hasRole(MINTER_ROLE, newMinter));

        // New minter can mint
        vm.prank(newMinter);
        token.mint(user1, 100 * 10**18, SESSION_REWARD);
        assertEq(token.balanceOf(user1), 100 * 10**18);
    }

    function test_AdminCanRevokeMinterRole() public {
        vm.prank(admin);
        token.revokeRole(MINTER_ROLE, relayer);

        assertFalse(token.hasRole(MINTER_ROLE, relayer));

        vm.prank(relayer);
        vm.expectRevert();
        token.mint(user1, 100 * 10**18, SESSION_REWARD);
    }

    // ============ View Function Tests ============

    function test_RemainingSupply() public {
        assertEq(token.remainingSupply(), token.MAX_SUPPLY());

        vm.prank(relayer);
        token.mint(user1, 1000 * 10**18, SESSION_REWARD);

        assertEq(token.remainingSupply(), token.MAX_SUPPLY() - 1000 * 10**18);
    }

    function test_IsMinter() public view {
        assertTrue(token.isMinter(relayer));
        assertFalse(token.isMinter(user1));
        assertFalse(token.isMinter(admin));
    }

    // ============ Multi-Reason Tracking Tests ============

    function test_TracksMultipleReasons() public {
        vm.startPrank(relayer);
        token.mint(user1, 100 * 10**18, SESSION_REWARD);
        token.mint(user1, 10 * 10**18, GYM_BONUS);
        token.mint(user2, 50 * 10**18, SESSION_REWARD);
        vm.stopPrank();

        assertEq(token.totalMintedByReason(SESSION_REWARD), 150 * 10**18);
        assertEq(token.totalMintedByReason(GYM_BONUS), 10 * 10**18);
        assertEq(token.totalMinted(user1), 110 * 10**18);
        assertEq(token.totalMinted(user2), 50 * 10**18);
    }

    // ============ Fuzz Tests ============

    function testFuzz_Mint(uint256 amount) public {
        amount = bound(amount, 1, token.MAX_SUPPLY());

        vm.prank(relayer);
        token.mint(user1, amount, SESSION_REWARD);

        assertEq(token.balanceOf(user1), amount);
    }
}
