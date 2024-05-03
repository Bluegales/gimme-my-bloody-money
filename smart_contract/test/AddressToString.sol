// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {AddressToString} from "../src/helpers/AddressToString.sol";
using AddressToString for address;

contract WorldCoinExample is Test {

    function setUp() public {}

    function testAddressToString() public view {
        address addr = address(0x1337);
        console.log(addr);
        string memory addrString = addr.toString();
        console.log(addrString);
    }
}
