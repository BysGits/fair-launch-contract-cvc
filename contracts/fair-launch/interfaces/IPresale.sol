// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

interface IPresale {
    function transferOwnership(address) external;
    function createSale(
        uint256[] calldata,
        address[] calldata,
        bool[] calldata
    ) external;
}
