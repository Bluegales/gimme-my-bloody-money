// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IWorldID} from "./IWorldID.sol";
import {ByteHasher} from "./helpers/ByteHasher.sol";
using ByteHasher for bytes;

contract Reputation {
    error AlreadyVoted();

    /// @dev The address of the World ID Router contract that will be used for verifying proofs
    IWorldID internal immutable worldId;
    /// @dev The app id used to generate the externalNullifierHash
    uint256 internal immutable appId;
    /// @dev The World ID group ID (1 for Orb-verified)
    uint256 internal immutable groupId = 1;

    int32 internal immutable reputationPositiveMultiplier;
    int32 internal immutable reputationNegativeMultiplier;

    /// @dev Whether a nullifier hash has been used already and by which address.
    /// @dev Used to keep the reputation even if the address changes.
    mapping(uint256 => address) internal nullifierHashesAddress;

    mapping(address => bool) internal isRegistered;
    mapping(address => int64) internal reputationScore;

    mapping(uint256 => bool) internal nullifierHashesVotes;

    /// @param _worldId The address of the WorldIDRouter that will verify the proofs
    /// @param _appId The World ID App ID (from Developer Portal)
    /// @param _action The World ID Action (from Developer Portal)
    constructor(
        address _worldId,
        string memory _appId,
        string memory _action,
        int32 _reputationPositiveMultiplier,
        int32 _reputationNegativeMultiplier
    ) {
        worldId = IWorldID(_worldId);
        appId = abi.encodePacked(_appId).hashToField();
        reputationPositiveMultiplier = _reputationPositiveMultiplier;
        reputationNegativeMultiplier = _reputationNegativeMultiplier;
    }

    function getScore(address account) external view returns (bool, int64) {
        return (isRegistered[account], reputationScore[account]);
    }

    /// @param signal An arbitrary input from the user that cannot be tampered with. In this case, it is the user's wallet address.
    /// @param root The root (returned by the IDKit widget).
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the IDKit widget).
    /// @param proof The zero-knowledge proof that demonstrates the claimer is registered with World ID (returned by the IDKit widget).
    function register(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        // worldId.verifyProof(
        //     root,
        //     groupId, // set to "1" in the constructor
        //     abi.encodePacked(signal).hashToField(),
        //     nullifierHash,
        //     externalNullifierHash,
        //     proof
        // );

        // If the worldIdUser has registed an account already, copy reputation score to new account
        address oldAccount = nullifierHashesAddress[nullifierHash];
        int64 score = 0;
        if (oldAccount == address(0)) {
            score = reputationScore[oldAccount];
            delete isRegistered[oldAccount];
            delete reputationScore[oldAccount];
        }
        nullifierHashesAddress[nullifierHash] = signal;
        isRegistered[signal] = true;
        reputationScore[signal] = score;
    }

    /// @param signal An arbitrary input from the user that cannot be tampered with. In this case, its the abi-encoded account and the bool wether the review is positive or negative
    /// @param root The root (returned by the IDKit widget).
    /// @param nullifierHash The nullifier hash for this proof, preventing double signaling (returned by the IDKit widget).
    /// @param proof The zero-knowledge proof that demonstrates the claimer is registered with World ID (returned by the IDKit widget).
    function feedback(
        address signal,
        address account,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        uint256 externalNullifierHash = abi
            .encodePacked(appId, account).hashToField();
        // worldId.verifyProof(
        //     root,
        //     groupId, // set to "1" in the constructor
        //     abi.encodePacked(signal).hashToField(),
        //     nullifierHash,
        //     externalNullifierHash,
        //     proof
        // );
        if (nullifierHashesVotes[nullifierHash]) revert AlreadyVoted();
        bool positive = signal == address(0x1);
        if (positive) {
            reputationScore[account] += reputationPositiveMultiplier;
        } else {
            reputationScore[account] -= reputationNegativeMultiplier;
        }
        nullifierHashesVotes[nullifierHash] = true;
    }
}
