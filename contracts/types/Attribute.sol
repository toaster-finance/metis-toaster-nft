// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

type Attribute is uint8;

library AttributeLib {
    function attribute(uint256 value) internal pure returns (Attribute) {
        return Attribute.wrap(uint8(value));
    }

    function eq(Attribute a, uint8 b) internal pure returns (bool) {
        return Attribute.unwrap(a) == b;
    }

    function lt(Attribute a, uint8 b) internal pure returns (bool) {
        return Attribute.unwrap(a) < b;
    }
}
