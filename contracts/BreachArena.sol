// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ZERO//BREACH Arena
/// @notice Mainnet receipts for wallet-authenticated, evidence-backed AI red-team battles.
contract BreachArena {
    error Unauthorized();
    error InvalidScore();
    error AttackAlreadyRecorded();
    error ZeroAddress();

    struct Battle {
        address operative;
        bytes32 vaultId;
        uint16 score;
        bool breached;
        bytes32 replayRoot;
        bytes32 modelHash;
        uint64 finalizedAt;
    }

    address public owner;
    mapping(address => bool) public operators;
    mapping(bytes32 => Battle) public battles;
    mapping(address => uint256) public totalScore;
    mapping(address => uint256) public breachCount;

    event OperatorUpdated(address indexed operator, bool trusted);
    event BattleFinalized(
        bytes32 indexed attackId,
        address indexed operative,
        bytes32 indexed vaultId,
        uint16 score,
        bool breached,
        bytes32 replayRoot,
        bytes32 modelHash
    );

    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
        emit OperatorUpdated(msg.sender, true);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert Unauthorized();
        _;
    }

    function setOperator(address operator, bool trusted) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = trusted;
        emit OperatorUpdated(operator, trusted);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        if (nextOwner == address(0)) revert ZeroAddress();
        owner = nextOwner;
    }

    function recordAttack(
        bytes32 attackId,
        address operative,
        bytes32 vaultId,
        uint16 score,
        bool breached,
        bytes32 replayRoot,
        bytes32 modelHash
    ) external onlyOperator {
        if (operative == address(0)) revert ZeroAddress();
        if (score > 100) revert InvalidScore();
        if (battles[attackId].finalizedAt != 0) revert AttackAlreadyRecorded();

        battles[attackId] = Battle({
            operative: operative,
            vaultId: vaultId,
            score: score,
            breached: breached,
            replayRoot: replayRoot,
            modelHash: modelHash,
            finalizedAt: uint64(block.timestamp)
        });
        totalScore[operative] += score;
        if (breached) breachCount[operative] += 1;

        emit BattleFinalized(
            attackId,
            operative,
            vaultId,
            score,
            breached,
            replayRoot,
            modelHash
        );
    }
}
