// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./ERC20Standard.sol";
import "./fair-launch/utils/Ownable.sol";

contract ERC20TestToken is Ownable, ERC20Standard {
    uint256 public immutable MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initial_supply
    ) ERC20Standard(_name, _symbol, _decimals) {
        _mint(msg.sender, MAX_INT);
    }

    function mint(address to, uint256 value) external onlyOwner {
        _mint(to, value);
    }

    function burn(address _addr, uint256 _amount) external onlyOwner {
        if(_addr != msg.sender) {
            require(allowance(_addr, msg.sender) >= _amount, "ERC20: Amount exceeds allowance");
        }

        _burn(_addr, _amount);
    }
}