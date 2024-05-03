// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library AddressToString {
	/// @dev Creates a keccak256 hash of a bytestring.
	/// @param account The address to convert
	/// @dev `>> 8` makes sure that the result is included in our field
	function toString(address account) internal pure returns (string memory) {
		bytes32 value = bytes32(uint256(uint160(account)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
	}
} 
