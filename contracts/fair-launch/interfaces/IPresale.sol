// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

interface IPresale {
    function createSale(
        uint256[] calldata,
        address[] calldata,
        bool[] calldata
    ) external;
}
