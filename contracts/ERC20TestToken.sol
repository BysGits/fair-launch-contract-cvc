// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./ERC20Standard.sol";
import "./interfaces/IMintable.sol";

contract ERC20TestToken is IMintable, ERC20Standard {
    uint256 public immutable MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20Standard(name, symbol, decimals) {
        _mint(msg.sender, MAX_INT);
    }

    function mint(address to, uint256 value) external override {
        _mint(to, value);
    }
}