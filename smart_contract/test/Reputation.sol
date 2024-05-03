// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWorldID} from "../src/IWorldID.sol";
import {Test, console} from "forge-std/Test.sol";
import {ByteHasher} from "../src/helpers/ByteHasher.sol";
import {Reputation} from "../src/Reputation.sol";

contract SignUpWorldcoinGatekeeperTest is Test {
    Reputation reputation;

    function setUp() public {
        address worldId = 0x42FF98C4E85212a5D31358ACbFe76a621b50fC02;
        string memory appId = "app_staging_8ed9ea69fa7c731c134b1ed124d06252";
        int32 reputationPositiveMultiplier = 1;
        int32 reputationNegativeMultiplier = 5;
        reputation = new Reputation(
            worldId,
            appId,
            reputationPositiveMultiplier,
            reputationNegativeMultiplier
        );
    }

    function testRepuationRegister() public {
        register2();
    }

    function testRepuationScore() public {
        // no initial score 
        {
            (bool has_score, int64 score) = reputation.getScore(address(1337));
            assertEq(has_score, false);
        }
        register2();
        // initial scores
        {
            (bool has_score, int64 score) = reputation.getScore(address(1337));
            assertEq(has_score, true);
            assertEq(score, 0);
        }
        {
            (bool has_score, int64 score) = reputation.getScore(address(1338));
            assertEq(has_score, true);
            assertEq(score, 0);
        }    
        vote2();
        // vote scores
        {
            (bool has_score, int64 score) = reputation.getScore(address(1337));
            assertEq(has_score, true);
            assertEq(score, -5);
        }
        {
            (bool has_score, int64 score) = reputation.getScore(address(1338));
            assertEq(has_score, true);
            assertEq(score, 1);
        }
    }

    function testRepuationVoteTwice() public {
        register2();
        vote2();
        {
            (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = generateProofVote(0);
            vm.expectRevert();
            reputation.feedback(signal, address(1337), merkle_root, nullifierHash, proof);
        }
    }

    function register2() internal {
        {
            (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = generateProofRegister(0);
            reputation.register(signal, merkle_root, nullifierHash, proof);
        }
        {
            (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = generateProofRegister(1);
            reputation.register(signal, merkle_root, nullifierHash, proof);
        }
    }

    function vote2() internal {
        {
            (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = generateProofVote(0);
            reputation.feedback(signal, address(1337), merkle_root, nullifierHash, proof);
        }
        {
            (address signal, uint256 merkle_root, uint256 nullifierHash, uint256[8] memory proof) = generateProofVote(1);
            reputation.feedback(signal, address(1338), merkle_root, nullifierHash, proof);
        }
    }

    function generateProofRegister(int id) internal pure returns(address, uint256, uint256, uint256[8] memory) {
        if (id == 0) {
            address signal = address(1337);
            uint256 merkle_root = 0x0b78b9e1edb64fcdfe978220b1b7b2a7f2d968c99ee6d2c3d7fe588ac08697bc;
            uint256 nullifierHash = 0x2ad8af493d0f3beb92ff57531a6b79dc1d571d0f55531462cd6c9f801ceb468f;
            uint256[8] memory proof;
            proof[0] = 0x14becfed52d9497da77e0e41f1c4931c423fdcb7ea1db2328b9939ae33452ce5 ;
            proof[1] = 0x15619bdfaead80cdfc3c549a56096ff342c4e44cbf88cd908bfbf61f70039613 ;
            proof[2] = 0x2f03d8f4a7ef0b0d1c1b0de39d04d428bb4daa3e48b3818c9013dcac361800b0 ;
            proof[3] = 0x062be50d99d64716dd5175f21736735d121d82fd1d7e002e76ba5c323ac2782f ;
            proof[4] = 0x1db43ea96d5f4b38d2e968bd5b7ed90d4b7ca0fef65001411b7258f0021c8ece ;
            proof[5] = 0x03e80727ad6ab7bbd1b8cb4172212b543f7637373ec76a0854711f5a9d64def9 ;
            proof[6] = 0x22a1892cb4b70cf95d7cac758c9af695410913b6f4981fe232c47f7546bd7c2d ;
            proof[7] = 0x144ff12daecab105cf016c1c470f6f8222f11dab580d5b5e475e56c32877af9e ;
            return (signal, merkle_root, nullifierHash, proof);
        }
        if (id == 1) {
            address signal = address(1338);
            uint256 merkle_root = 0x0b78b9e1edb64fcdfe978220b1b7b2a7f2d968c99ee6d2c3d7fe588ac08697bc;
            uint256 nullifierHash = 0x1cd4e3feea297951496c0fe4f824d784e58c5e7b60436e1c80d3884ce96ac1a7;
            uint256[8] memory proof;
            proof[0] = 0x20a143bc6648e66f21e7be192e6174bcd3abdbb27004daff2f55d6e0dc42694f ;
            proof[1] = 0x2f065166410686ef7a285d9a58869249c706d8d6ab05dcfff92ec02bd48b606d ;
            proof[2] = 0x1605cbdfdb6f4a2c77bca0421bb23d37884083609e7560d7f262d88036ba9275 ;
            proof[3] = 0x16c930d3b6dbd33e3f04d7471d384595ef565deeef9c91e050c8146766dc1eb2 ;
            proof[4] = 0x2bd83b770bc41e5f2648d861d23584a74be93491cd3622037d4a266299c3d2cc ;
            proof[5] = 0x2c34e3fc1e470dda58a97ea1be4c29e2f3b31b7f9ea1a55cac77bac61e50a37e ;
            proof[6] = 0x098cea4c4ece31f515d4e65e5767ebc6fb132c23467683f18fcb5c0ec0a5ddf2 ;
            proof[7] = 0x2ae571c5fbfacd8284e4c007f069f662d25e5d5ea29f2ac225443a48e156cabb ;
            return (signal, merkle_root, nullifierHash, proof);
        }
        revert("invalid id");
    }

    function generateProofVote(int id) internal pure returns(address, uint256, uint256, uint256[8] memory) {
        if (id == 0) {
            address signal = address(0);
            uint256 merkle_root = 0x0b78b9e1edb64fcdfe978220b1b7b2a7f2d968c99ee6d2c3d7fe588ac08697bc;
            uint256 nullifierHash = 0x1cd4e3feea297951496c0fe4f824d784e58c5e7b60436e1c80d3884ce96ac1a7;
            uint256[8] memory proof;
            proof[0] = 0x20a143bc6648e66f21e7be192e6174bcd3abdbb27004daff2f55d6e0dc42694f ;
            proof[1] = 0x2f065166410686ef7a285d9a58869249c706d8d6ab05dcfff92ec02bd48b606d ;
            proof[2] = 0x1605cbdfdb6f4a2c77bca0421bb23d37884083609e7560d7f262d88036ba9275 ;
            proof[3] = 0x16c930d3b6dbd33e3f04d7471d384595ef565deeef9c91e050c8146766dc1eb2 ;
            proof[4] = 0x2bd83b770bc41e5f2648d861d23584a74be93491cd3622037d4a266299c3d2cc ;
            proof[5] = 0x2c34e3fc1e470dda58a97ea1be4c29e2f3b31b7f9ea1a55cac77bac61e50a37e ;
            proof[6] = 0x098cea4c4ece31f515d4e65e5767ebc6fb132c23467683f18fcb5c0ec0a5ddf2 ;
            proof[7] = 0x2ae571c5fbfacd8284e4c007f069f662d25e5d5ea29f2ac225443a48e156cabb ;
            return (signal, merkle_root, nullifierHash, proof);
        }
        if (id == 1) {
            address signal = address(1);
            uint256 merkle_root = 0x0b78b9e1edb64fcdfe978220b1b7b2a7f2d968c99ee6d2c3d7fe588ac08697bc;
            uint256 nullifierHash = 0x1cd4e3feea297951496c0fe4f824d784e58c5e7b60436e1c80d3884ce96ac1a8;
            uint256[8] memory proof;
            proof[0] = 0x20a143bc6648e66f21e7be192e6174bcd3abdbb27004daff2f55d6e0dc42694f ;
            proof[1] = 0x2f065166410686ef7a285d9a58869249c706d8d6ab05dcfff92ec02bd48b606d ;
            proof[2] = 0x1605cbdfdb6f4a2c77bca0421bb23d37884083609e7560d7f262d88036ba9275 ;
            proof[3] = 0x16c930d3b6dbd33e3f04d7471d384595ef565deeef9c91e050c8146766dc1eb2 ;
            proof[4] = 0x2bd83b770bc41e5f2648d861d23584a74be93491cd3622037d4a266299c3d2cc ;
            proof[5] = 0x2c34e3fc1e470dda58a97ea1be4c29e2f3b31b7f9ea1a55cac77bac61e50a37e ;
            proof[6] = 0x098cea4c4ece31f515d4e65e5767ebc6fb132c23467683f18fcb5c0ec0a5ddf2 ;
            proof[7] = 0x2ae571c5fbfacd8284e4c007f069f662d25e5d5ea29f2ac225443a48e156cabb ;
            return (signal, merkle_root, nullifierHash, proof);
        }
        revert("invalid id");
    }
}

