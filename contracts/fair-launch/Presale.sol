// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IController.sol";
import "./interfaces/IPresale.sol";
import "./utils/Ownable.sol";
import "./libraries/SafeMath.sol";
import "../v2-periphery/interfaces/IUniswapV2Router01.sol";

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;
    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

contract Presale is Ownable, ReentrancyGuard, IPresale {
    using SafeMath for uint256;

    IERC20 public token;
    address public router;
    address public controller;
    uint256 private tokenDecimals;
    uint256 public totalOfContributors;
    uint256 public saleAmount;
    uint256 public totalDeposit;
    uint256 public softCap;
    uint256 public maxDeposit;
    uint256 public minDeposit;
    uint256 public start;
    uint256 public end;
    uint256 public lpPercent;       // 10000 -> 100%
    bool public isPoolCreated;
    bool public hasWhitelist;
    bool public isInit;

    mapping(address => uint256) public contributions;

    mapping(address => bool) public isWhitelisted;

    event TokensPurchased(
        address purchaser,
        uint256 weiAmount,
        uint256 currentSoftcap
    );

    modifier notZeroAddress(address _addr) {
        require(address(_addr) != address(0), "Zero address");
        _;
    }

    modifier initOnce() {
        require(isInit == false, "Init");
        _;
        isInit = true;
    }

    constructor() {}

    // _data: (0) token decimal, (1) sale amount, (2) soft cap, (3) start time, (4) end time, (5) max deposit per address, (6) min deposit per address, (7) liquidity pool percent
    // _addr: (0) token address, (1) controller address
    // _bool: (0) hasWhitelist
    function createSale(
        uint256[] memory _data,
        address[] memory _addr,
        bool[] memory _bool
    ) public onlyOwner initOnce {
        require(
            address(_addr[0]) != address(0) && address(_addr[1]) != address(0),
            "Pre-Sale: zero address"
        );

        require(
            _data[1] <= IERC20(_addr[0]).totalSupply(),
            "Pre-Sale: Presale token amount must be lower then totalsupply"
        );

        require(
            _data[2] > 0, 
            "Pre-Sale: soft cap must be a positive number"
        );

        require(
            _data[3] > block.timestamp,
            "Pre-Sale: start time must be greater than current timestamp"
        );

        require(
            _data[3] < _data[4], 
            "Pre-Sale: start time must be before end time"
        );

        require(
            _data[5] >= _data[6] || _data[5] == 0,
            "Pre-Sale: max deposit must be greater than min deposit"
        );

        require(
            _data[7] >= 5000,
            "Pre-Sale: liquidity pool percent must be greater than 50%"
        );

        token = IERC20(_addr[0]);
        router = IController(_addr[1]).router();
        controller = _addr[1];

        tokenDecimals = _data[0];
        saleAmount = _data[1];
        softCap = _data[2];
        start = _data[3];
        end = _data[4];
        maxDeposit = _data[5];
        minDeposit = _data[6];
        lpPercent = _data[7];
        hasWhitelist = _bool[0];
    }

    function getTokenAmount(uint256 weiAmount) public view returns (uint256) {
        if (totalDeposit == 0) {
            return 0;
        }
        return
            uint256(1 ether)
                .mul(saleAmount)
                .mul(weiAmount)
                .div(totalDeposit)
                .div(10 ** 18);
    }

    function enableWhitelist(bool _state) public onlyOwner {
        hasWhitelist = _state;
    }

    function setWhitelist(
        address[] memory _addr,
        bool[] memory _state
    ) public onlyOwner {
        require(hasWhitelist, "Whitelist not enabled");
        require(_addr.length == _state.length, "Invalid input");
        for (uint256 i = 0; i < _addr.length; i++) {
            isWhitelisted[_addr[i]] = _state[i];
        }
    }

    function setSaleAmount(uint256 _saleAmount) public onlyOwner {
        saleAmount = _saleAmount;
    }

    function setSoftCap(uint256 _softCap) public onlyOwner {
        require(_softCap > 0, "Pre-Sale: soft cap must be a positive number");
        softCap = _softCap;
    }

    function setMaxDeposit(uint256 _maxDeposit) public onlyOwner {
        maxDeposit = _maxDeposit;
    }

    function setMinDeposit(uint256 _minDeposit) public onlyOwner {
        minDeposit = _minDeposit;
    }

    function setStartTime(uint256 _start) public onlyOwner {
        require(
            _start > block.timestamp,
            "Pre-Sale: start time must be greater than current timestamp"
        );
        require(_start < end, "Pre-Sale: start time must be before end time");

        start = _start;
    }

    function setEndTime(uint256 _end) public onlyOwner {
        require(start < _end, "Pre-Sale: start time must be before end time");
        require(_end >= block.timestamp, "Pre-Sale: end time must be after current time");
        end = _end;
    }

    function endSale() public onlyOwner {
        require(
            start < block.timestamp,
            "Pre-Sale: Presale must has started"
        );
        setEndTime(block.timestamp);
        
        if(!isPoolCreated) {
            uint256 lpAmount = totalDeposit * lpPercent / 10000;
            uint256 amountXCR = address(this).balance * (10000 - IController(controller).fee()) / 10000;
            IUniswapV2Router01(router).addLiquidityETH{value: amountXCR}(
                address(token),
                lpAmount,
                0,
                0,
                owner(),
                block.timestamp + 600
            );

            isPoolCreated = true;
        }
    }

    function buy()
        external
        payable
        nonReentrant
        presaleActive
        checkWhitelist(msg.sender)
    {
        uint256 weiAmount = msg.value;
        require(weiAmount != 0, "Pre-Sale: weiAmount is 0");
        require(
            weiAmount.add(contributions[msg.sender]) <= maxDeposit ||
                maxDeposit == 0,
            "Pre-Sale: Can't buy more than max deposit"
        );

        if (contributions[msg.sender] == 0) {
            totalOfContributors = totalOfContributors.add(1);
        }
        totalDeposit = totalDeposit.add(weiAmount);
        contributions[msg.sender] = contributions[msg.sender].add(weiAmount);
        emit TokensPurchased(msg.sender, weiAmount, softCap);
    }

    function claimToken() external nonReentrant saleEnded {
        require(totalDeposit >= softCap, "Pre-Sale: soft cap hasn't been reached");
        require(
            contributions[msg.sender] > 0,
            "Pre-Sale: No tokens left to claim"
        );
        uint256 tokensAmt = getTokenAmount(contributions[msg.sender]);
        contributions[msg.sender] = 0;
        token.transfer(msg.sender, tokensAmt);
    }

    function claimXCR() external nonReentrant saleEnded {
        require(totalDeposit < softCap, "Pre-Sale: Can't withdraw contributions");
        require(
            contributions[msg.sender] > 0,
            "Pre-Sale: No tokens left to claim"
        );
        (bool success, ) = payable(msg.sender).call{
            value: contributions[msg.sender]
        }(new bytes(0));
        require(success, "pre-sale: Ether transfer failed");
        totalDeposit = totalDeposit.sub(contributions[msg.sender]);
        contributions[msg.sender] = 0;
    }

    function emergencyWithdraw() external nonReentrant presaleActive {
        require(
            contributions[msg.sender] > 0,
            "Pre-Sale: No tokens left to withdraw"
        );
        (bool success, ) = payable(msg.sender).call{
            value: contributions[msg.sender]
        }(new bytes(0));
        require(success, "pre-sale: Ether transfer failed");
        totalOfContributors = totalOfContributors.sub(1);
        totalDeposit = totalDeposit.sub(contributions[msg.sender]);
        contributions[msg.sender] = 0;
    }

    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function isSaleEnded() public view returns(bool) {
        return block.timestamp > end;
    }

    function isSaleStarted() public view returns(bool) {
        return block.timestamp >= start;
    }

    modifier presaleActive() {
        require(
            start < block.timestamp && block.timestamp < end,
            "Pre-Sale: Presale must be active"
        );
        _;
    }

    modifier saleEnded() {
        require(
            end < block.timestamp,
            "Pre-Sale: Presale should not be active"
        );
        _;
    }

    modifier checkWhitelist(address _addr) {
        if (hasWhitelist) {
            require(isWhitelisted[_addr], "Pre-Sale: Account not whitelisted");
        }
        _;
    }
}
