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
        // worldId = IWorldID(0x42FF98C4E85212a5D31358ACbFe76a621b50fC02);
        worldId = IWorldID(0x11cA3127182f7583EfC416a8771BD4d11Fae4334);
        string memory _appId = "app_staging_51c06a1df3fa4b5f004db3fb8dfe6569";
        string memory _action = "test";
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }

    // "verification_level": "orb",
    // "proof": "0x056d319a4cafcce6e18df70fe7304dfd96dc4d98fbcca3738651aea79d317c53270b895a890a196bc0aa7435845e0d476f1a528623381b7c8cdd36f42e791f2b1b879e88ff6f1cee7116d71a80e52e0d77b90113b2dd0ddd02a859ddc7cc383a021d81ffb22658f6ca33ca4f5e838f3982e10ee6c86d7876bd8d508247b3c7310674120b44b050db94b3889e896d969baab96730793eada911442d735c04e562124c9b446194b76a66b3509141c0d871200ad3424f8772218a95b396bd5c6ab905712406a76fd420b14909687ac7a5279ffbb96d7bbb5ec62a3d2734d57e39e8227337049e00603d9817f3b7831da58864eb126ae909db2c63275b772958799c",
    // "merkle_root": "0x1e28120c18d4a1025fbcbc2401462cfce8406fc87b7c8a0468c474649687df70",
    // "nullifier_hash": "0x21ea8bf989c364c27b5baf90516fe582b8870c166db90b6a17840a46add5b1e3",
    // "credential_type": "orb"

    function testVerification() public view {
        address signal = 0x11118B057bC0F7cBCF85f1e4d6B61CD5fFB22773;
        uint256 merkle_root = 0x0870b6bd9b7690a5ee576e3487d84665e7d254faf73094c39b2e557b8ac5f401;
        uint256 nullifierHash = 0x2ad8af493d0f3beb92ff57531a6b79dc1d571d0f55531462cd6c9f801ceb468f;
        uint256[8] memory proof;
        proof[0] = 1543880139493224957816207891725465825182729406773514166885280037017171102242 ;
        proof[1] = 5280689801289164915180263683531130927183241732527955062444950466768271534403 ;
        proof[2] = 2600497068749577447370248703354997785803723639016664269575599611738407427536 ;
        proof[3] = 2057280095321131360088483692185513849331505435146936498963626374582272063707 ;
        proof[4] = 6141412590122529520374159229236804634776052606087832972981891244737190828594 ;
        proof[5] = 16038981563753225357354186391651788766802138626848311505106935532464592117759 ;
        proof[6] = 12803538545904148534406555076383420651730211210735164401881558845609717115768 ;
        proof[7] = 4112185923621838055502715055608932524805007502600993063674226442813498624 ;
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
