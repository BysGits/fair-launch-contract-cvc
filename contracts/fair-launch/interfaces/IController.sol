// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

interface IController {
    function fee() external view returns (uint256);
    function router() external view returns (address);
}
