// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./utils/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./Presale.sol";


contract Controller is Ownable {
    uint256 public fee;             // 10000 -> 100%

    address public router;

    mapping(string => address) public launchAddress;

    constructor() {}

    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function setFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }

    function setRouter(address _router) public onlyOwner {
        router = _router;
    }

    // _data: (0) token decimal, (1) sale amount, (2) soft cap, (3) start time, (4) end time, (5) max deposit per address, (6) min deposit per address, (7) liquidity pool percent
    // _addr: (0) token address, (1) controller address
    // _bool: (0) hasWhitelist
    // _str:  (0) id
    function createSale(
        uint256[] memory _data,
        address[] memory _addr,
        bool[] memory _bool,
        string[] memory _str
    ) public {
        require(launchAddress[_str[0]] == address(0), "Already created");
        address saleAddr;
        bytes memory bytecode = type(Presale).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, _addr[0], block.timestamp));
        assembly {
            saleAddr := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IPresale(saleAddr).createSale(_data, _addr, _bool);
        Ownable(saleAddr).transferOwnership(msg.sender);
        IERC20(_addr[0]).transferFrom(msg.sender, saleAddr, _data[1]);

        launchAddress[_str[0]] = saleAddr;

    }
}
