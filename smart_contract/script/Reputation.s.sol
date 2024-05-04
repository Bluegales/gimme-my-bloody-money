// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Reputation} from "../src/Reputation.sol";

contract DeployReputation is Script {
    Reputation reputation;

    function setUp() public {
    }

    function run() public {
        address worldId = 0x42FF98C4E85212a5D31358ACbFe76a621b50fC02;
        string memory appId = "app_staging_8ed9ea69fa7c731c134b1ed124d06252";
        int32 reputationPositiveMultiplier = 1;
        int32 reputationNegativeMultiplier = 5;
        vm.broadcast();
        reputation = new Reputation(
            worldId,
            appId,
            reputationPositiveMultiplier,
            reputationNegativeMultiplier
        );
        console.log(address(reputation));
    }
}

// contract SetMaciGatekeeper is Script {
//     SignUpWorldcoinGatekeeper gatekeeper;
//     address maci;

//     function setUp() public {
//         gatekeeper = SignUpWorldcoinGatekeeper(0x2E3301C399DCAd3556e7c36e9a0197dB686bD899);
//         maci = address(0x587E495af03FE6C3ec56a98394807c753B827a75);
//         console.log(address(this));
//     }

//     function run() public {
//         vm.broadcast();
//         gatekeeper.setMaciInstance(maci);
//     }
// }
