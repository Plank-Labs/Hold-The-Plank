// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Relics
 * @notice ERC-1155 NFT collection for Conquer Plank achievements
 * @dev Users mint with backend-provided signatures (pay their own gas)
 *
 * Relic Tiers:
 * 1 - Bronze Shield: 1 minute total
 * 2 - Silver Helmet: 10 minutes total
 * 3 - Gold Sword: 1 hour total
 * 4 - Diamond Crown: 10 hours total
 * 5 - Kronos Slayer: 100 hours total
 */
contract Relics is ERC1155, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    string public name = "Conquer Plank Relics";
    string public symbol = "RELIC";

    // Backend signer address for signature verification
    address public signer;

    // Track claims: user => tokenId => claimed
    mapping(address => mapping(uint256 => bool)) public hasClaimed;

    // Nonces for replay protection
    mapping(address => uint256) public nonces;

    // Token requirements in seconds
    mapping(uint256 => uint256) public tokenRequirements;

    // Token names for metadata
    mapping(uint256 => string) public tokenNames;

    event RelicMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 nonce
    );

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event BaseURIUpdated(string newURI);

    error InvalidTokenId();
    error AlreadyClaimed();
    error InvalidSignature();
    error SignatureExpired();
    error ZeroAddress();

    constructor(
        address initialOwner,
        address initialSigner,
        string memory baseURI
    ) ERC1155(baseURI) Ownable(initialOwner) {
        if (initialSigner == address(0)) revert ZeroAddress();

        signer = initialSigner;

        // Initialize token requirements (in seconds)
        tokenRequirements[1] = 60;      // Bronze Shield: 1 minute
        tokenRequirements[2] = 600;     // Silver Helmet: 10 minutes
        tokenRequirements[3] = 3600;    // Gold Sword: 1 hour
        tokenRequirements[4] = 36000;   // Diamond Crown: 10 hours
        tokenRequirements[5] = 360000;  // Kronos Slayer: 100 hours

        // Initialize token names
        tokenNames[1] = "Bronze Shield";
        tokenNames[2] = "Silver Helmet";
        tokenNames[3] = "Gold Sword";
        tokenNames[4] = "Diamond Crown";
        tokenNames[5] = "Kronos Slayer";
    }

    /**
     * @notice Mint a relic with a backend-provided signature
     * @param tokenId The relic token ID (1-5)
     * @param deadline Signature expiration timestamp
     * @param signature Backend signature authorizing the mint
     */
    function mintWithSignature(
        uint256 tokenId,
        uint256 deadline,
        bytes memory signature
    ) external {
        if (tokenId == 0 || tokenId > 5) revert InvalidTokenId();
        if (hasClaimed[msg.sender][tokenId]) revert AlreadyClaimed();
        if (block.timestamp > deadline) revert SignatureExpired();

        // Verify signature
        uint256 currentNonce = nonces[msg.sender];
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                tokenId,
                currentNonce,
                deadline,
                block.chainid,
                address(this)
            )
        );

        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(signature);

        if (recoveredSigner != signer) revert InvalidSignature();

        // Update state
        hasClaimed[msg.sender][tokenId] = true;
        nonces[msg.sender] = currentNonce + 1;

        // Mint the NFT
        _mint(msg.sender, tokenId, 1, "");

        emit RelicMinted(msg.sender, tokenId, currentNonce);
    }

    /**
     * @notice Update the backend signer address
     * @param newSigner New signer address
     */
    function setSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();

        address oldSigner = signer;
        signer = newSigner;

        emit SignerUpdated(oldSigner, newSigner);
    }

    /**
     * @notice Update the base URI for token metadata
     * @param newURI New base URI
     */
    function setURI(string memory newURI) external onlyOwner {
        _setURI(newURI);
        emit BaseURIUpdated(newURI);
    }

    /**
     * @notice Get the URI for a specific token
     * @param tokenId Token ID to query
     * @return Token metadata URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (tokenId == 0 || tokenId > 5) revert InvalidTokenId();
        return string(abi.encodePacked(super.uri(tokenId), _toString(tokenId), ".json"));
    }

    /**
     * @notice Check which relics a user has claimed
     * @param user Address to check
     * @return claimed Array of booleans for tokens 1-5
     */
    function getClaimedRelics(address user) external view returns (bool[5] memory claimed) {
        for (uint256 i = 1; i <= 5; ) {
            claimed[i - 1] = hasClaimed[user][i];
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get all relic balances for a user
     * @param user Address to check
     * @return balances Array of balances for tokens 1-5
     */
    function getRelicBalances(address user) external view returns (uint256[5] memory balances) {
        for (uint256 i = 1; i <= 5; ) {
            balances[i - 1] = balanceOf(user, i);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get the message hash for signature generation (for backend use)
     * @param user User address
     * @param tokenId Token ID
     * @param nonce User's current nonce
     * @param deadline Signature deadline
     * @return The message hash to sign
     */
    function getMessageHash(
        address user,
        uint256 tokenId,
        uint256 nonce,
        uint256 deadline
    ) external view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                user,
                tokenId,
                nonce,
                deadline,
                block.chainid,
                address(this)
            )
        );
    }

    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
