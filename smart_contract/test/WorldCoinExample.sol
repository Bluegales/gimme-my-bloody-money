// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWorldID} from "../src/IWorldID.sol";
import {Test, console} from "forge-std/Test.sol";
import {ByteHasher} from "../src/helpers/ByteHasher.sol";

contract WorldCoinExample is Test {
    using ByteHasher for bytes;
    uint256 internal externalNullifierHash;
    IWorldID internal worldId;
    uint256 internal immutable groupId = 1;

    function setUp() public {
        worldId = IWorldID(0x42FF98C4E85212a5D31358ACbFe76a621b50fC02);
        // worldId = IWorldID(0x469449f251692E0779667583026b5A1E99512157);
        string memory _appId = "app_staging_51c06a1df3fa4b5f004db3fb8dfe6569";
        string memory _action = "test";
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }

    function testVerification() public view {
        address signal = 0x11118B057bC0F7cBCF85f1e4d6B61CD5fFB22773;
        uint256 merkle_root = 0x0f0549d8206b96d27e696e47fa03b10bf903e4675d871b061a8e2ebd968464d6;
        uint256 nullifierHash = 0x2ad8af493d0f3beb92ff57531a6b79dc1d571d0f55531462cd6c9f801ceb468f;
        uint256[8] memory proof;
        proof[0] = 0x29939fcebaadd3aae4e5400e5a4bf927331de3fbd7761df74b1759486d7e638c ;
        proof[1] = 0x28d56a3cf3660b55032bd1b724737f67721148474eb7b0b37ecf70797caffc18 ;
        proof[2] = 0x14f5547cb7366aa04bbbd416d92b74f343838efbd4153384c864a9672bdbd0b6 ;
        proof[3] = 0x19251475cf9b5dfd8342ff14a700255aaa42303ab6f27c7e17ad116f628b6863 ;
        proof[4] = 0x2def2222be6805d3058ba139996179b397b3317e1ba6d046b1ad46db1c8628cf ;
        proof[5] = 0x2045124cf6cd7bedbe2f5666d91370060baa69ceae4f5ed733fe65b9700daf62 ;
        proof[6] = 0x240257251f5d4ec5757057a3a9bf6562dd09af9a0f08804a8cbe1266a6b76925 ;
        proof[7] = 0x262603158aaf68e53c0ed16cb427e1a91f1675f479d30ea128be84ebeae333eb ;
        verifyAndExecute(signal, merkle_root, nullifierHash, proof);
    }

    function verifyAndExecute (
    address signal,
    uint256 root,
    uint256 nullifierHash,
    uint256[8] memory proof
    ) view internal {
        // First, we make sure this person hasn't done this before
        // if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
        // We now verify the provided proof is valid and the user is verified by World ID
        worldId.verifyProof(
            root,
            groupId, // set to "1" in the constructor
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // We now record the user has done this, so they can't do it again (sybil-resistance)
        // nullifierHashes[nullifierHash] = true;

        // Finally, execute your logic here, knowing the user is verified
    }
}
