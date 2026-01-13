// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PlankToken
 * @notice ERC-20 token for the Conquer Plank dApp
 * @dev Implements role-based minting via a backend relayer
 *
 * Token Economics:
 * - Max Supply: 1,000,000,000 PLANK
 * - Reward Rate: 1 PLANK per 20 seconds of good form
 * - Gym Bonus: 10 PLANK one-time signup
 * - Gym Share: 10% of user rewards go to gym owner
 */
contract PlankToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    // Reason identifiers for analytics
    bytes32 public constant SESSION_REWARD = keccak256("SESSION_REWARD");
    bytes32 public constant GYM_BONUS = keccak256("GYM_BONUS");
    bytes32 public constant STREAK_BONUS = keccak256("STREAK_BONUS");
    bytes32 public constant REFERRAL_BONUS = keccak256("REFERRAL_BONUS");
    bytes32 public constant GYM_REFERRAL_SHARE = keccak256("GYM_REFERRAL_SHARE");

    // Track total minted per user for analytics
    mapping(address => uint256) public totalMinted;

    // Track total minted per reason
    mapping(bytes32 => uint256) public totalMintedByReason;

    event PlankMinted(
        address indexed to,
        uint256 amount,
        bytes32 indexed reason
    );

    event BatchMinted(
        address[] recipients,
        uint256[] amounts,
        bytes32 indexed reason,
        uint256 totalAmount
    );

    error MaxSupplyExceeded();
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();

    constructor(address admin, address relayer) ERC20("Plank Token", "PLANK") {
        if (admin == address(0) || relayer == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, relayer);
    }

    /**
     * @notice Mint tokens to a single recipient
     * @param to Recipient address
     * @param amount Amount to mint (in wei)
     * @param reason Reason identifier for tracking
     */
    function mint(
        address to,
        uint256 amount,
        bytes32 reason
    ) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();

        _mint(to, amount);

        totalMinted[to] += amount;
        totalMintedByReason[reason] += amount;

        emit PlankMinted(to, amount, reason);
    }

    /**
     * @notice Batch mint tokens to multiple recipients (gas efficient)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint (in wei)
     * @param reason Reason identifier for tracking
     */
    function mintBatch(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32 reason
    ) external onlyRole(MINTER_ROLE) {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();

        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length; ) {
            totalAmount += amounts[i];
            unchecked { ++i; }
        }

        if (totalSupply() + totalAmount > MAX_SUPPLY) revert MaxSupplyExceeded();

        for (uint256 i = 0; i < recipients.length; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();

            _mint(recipients[i], amounts[i]);
            totalMinted[recipients[i]] += amounts[i];

            emit PlankMinted(recipients[i], amounts[i], reason);

            unchecked { ++i; }
        }

        totalMintedByReason[reason] += totalAmount;

        emit BatchMinted(recipients, amounts, reason, totalAmount);
    }

    /**
     * @notice Get remaining mintable supply
     * @return Remaining tokens that can be minted
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @notice Check if an address has minter role
     * @param account Address to check
     * @return True if address can mint
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }
}
