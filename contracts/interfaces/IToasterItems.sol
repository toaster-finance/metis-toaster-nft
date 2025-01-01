// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;
import "../types/Attribute.sol";

interface IToasterItems {
    function useItems(address user, uint256[] memory ids) external;

    function totalAttributes() external view returns (uint8);
}
