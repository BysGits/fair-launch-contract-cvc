// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./utils/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./IPresale.sol";

contract Controller is Ownable {
    uint256 public fee;             // 10000 -> 100%

    address public router;

    mapping(string => address) public launchAddress;

    constructor(uint256 _fee, address _router) {
        fee = _fee;
        router = _router;
    }

    function createSale(
        uint256[] memory _data,
        address[] memory _addr,
        bool[] memory _bool,
        string[] memory _str
    ) public {
        address saleAddr;
        bytes memory bytecode = type(Presale).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, _addr[0], block.timestamp));
        assembly {
            saleAddr := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IPresale(saleAddr).createSale(_data, _addr, _bool);
        IPresale(saleAddr).transferOwnership(msg.sender);
        IERC20(_addr[0]).transferFrom(msg.sender, saleAddr, _data[1]);

        launchAddress[_str[0]] = saleAddr;

    }
}
