const { ethers } = require("hardhat");
const { expect } = require("chai");
const fs = require("fs");
const BigNumber = require("bignumber.js");

const getBlockTimeStamp = async () => {
    const blockNumber = await ethers.provider.getBlockNumber();

    // Get the block information for the current block
    const block = await ethers.provider.getBlock(blockNumber);

    // Get the timestamp for the current block
    return block.timestamp;
}

const nextBlock = async (ms) => {
    // Set the next block timestamp
    await ethers.provider.send("evm_setNextBlockTimestamp", [await getBlockTimeStamp() + ms]);

    // Mine a new block to update the current block timestamp
    await ethers.provider.send("evm_mine");
}

const getWeiCost = async (tx) => {
    const { gasUsed } = await tx.wait();

    // Calculate the wei cost of the transaction
    return gasUsed.mul(tx.gasPrice);
}

describe("Presale", function () {
    let PresaleProxy, proxy;
    let Presale, presale;
    let ERC20TestToken, erc20TestToken;

    let owner, addr1, addr2, addrs;

    before(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        console.log(`Owner: ${owner.address}`);
        console.log(`Account 1: ${addr1.address}`);
        console.log(`Account 2: ${addr2.address}`);

        /**
         * Deploy presale (implementation) contract
         */
        Presale = await ethers.getContractFactory("Presale");
        presale = await Presale.connect(owner).deploy();

        /**
         * Deploy proxy contract
         */
        PresaleProxy = await ethers.getContractFactory("PresaleProxy");
        proxy = await PresaleProxy.connect(owner).deploy("0x0000000000000000000000000000000000000000");

        console.log(`Proxy: ${proxy.address}`);
    });

    describe("PresaleProxy", function () {

        it("Only proxy owner can upgrade contract", async function () {
            // console.log(await proxy.connect(owner).owner())
            await expect(proxy.connect(addr1).upgradeTo(presale.address)).to.be.reverted;
            expect(await proxy.connect(owner).upgradeTo(presale.address)).to.be.ok;
            expect(await proxy.implementation()).to.be.equal(presale.address);
        });

        it("Cannot upgrade to the current implementation", async function () {
            await expect(proxy.connect(owner).upgradeTo(presale.address)).to.be.reverted;
            let exchange2 = await Presale.deploy();

            expect(await proxy.connect(owner).upgradeTo(exchange2.address)).to.be.ok;
        });

        it("Only proxy owner can transfer ownership", async function () {
            //Address that is not owner can not transfer ownership
            await expect(proxy.connect(addr1).transferOwnership(addr1.address)).to.be.reverted;

            //Only owner can transfer, example: transfer ownership to address 1
            expect(await proxy.connect(owner).transferOwnership(addr1.address)).to.be.ok;

            //Now address 1 is owner and can transfer ownership to another address
            expect(await proxy.connect(addr1).transferOwnership(owner.address)).to.be.ok;
        });

        it("Can not transfer proxy ownership to the zero address", async function () {
            //transfer to zero address but fail
            await expect(proxy.connect(owner).transferOwnership("0x0000000000000000000000000000000000000000")).to.be.reverted;

            //But with normal address, owner can normally transfer
            expect(await proxy.connect(owner).transferOwnership(addr1.address)).to.be.ok;
            expect(await proxy.connect(addr1).transferOwnership(owner.address)).to.be.ok;
        });
    });

    before(async function () {

        // Upgrade to the implementation
        await proxy.connect(owner).upgradeTo(presale.address);

        // Load the implementation contract from proxy address
        presale = await Presale.attach(proxy.address);

        /**
         * Deploy ERC20TestToken contract
         */
        ERC20TestToken = await ethers.getContractFactory("ERC20TestToken");
        erc20TestToken = await ERC20TestToken.connect(owner).deploy("Test", "T", 18, owner.address);


    });

    describe("Presale", function () {
        let now;

        beforeEach(async function () {
            // now = Math.floor(Date.now() / 1000);
            now = await getBlockTimeStamp();

            /**
             * Deploy presale (implementation) contract
             */
            presale = await Presale.connect(owner).deploy();

            /**
             * Deploy proxy contract
             */
            PresaleProxy = await ethers.getContractFactory("PresaleProxy");
            proxy = await PresaleProxy.connect(owner).deploy("0x0000000000000000000000000000000000000000");

            // Upgrade to the implementation
            await proxy.connect(owner).upgradeTo(presale.address);

            // Load the implementation contract from proxy address
            presale = await Presale.attach(proxy.address);

            await erc20TestToken.connect(owner).approve(proxy.address, "10000000000000");
            // console.log(await erc20TestToken.allowance(owner.address, proxy.address));

            // mapping(address => uint256) public contributions;
            // uint256 contributors;
            // address public ownerWallet;

            // IERC20 public token;
            // uint256 private tokenDecimals;
            // uint256 public presaleAmount;
            // uint256 public weiRaised;
            // uint256 public softCap;
            // uint256 public start;
            // uint256 public end;
            // uint256 _maxContribution
            await presale.connect(owner).initPresale(
                erc20TestToken.address,
                18,
                "1000000000000",
                ethers.utils.parseUnits("0.01", "ether").toString(),
                now + 1000,
                now + 2 * 60 * 1000,
                ethers.utils.parseUnits("0.001", "ether").toString(),
            );
        });

        it("The implementation contract should be loaded from the proxy address", async function () {
            expect(presale.address).to.be.equal(proxy.address);
        });

        it("Data should be the same after changing implementation contract", async function () {

            // Deploy exchange contract
            presale = await Presale.deploy();

            // Upgrade to the new implementation
            await proxy.connect(owner).upgradeTo(presale.address);

            // Load the implementation contract from proxy address
            presale = Presale.attach(proxy.address);
            // console.log(owner.address)
            expect(await presale.connect(owner).owner()).to.be.equal(owner.address);
            expect(await presale.connect(owner).isInit()).to.be.equal(true);
            expect(await presale.connect(owner).token()).to.be.equal(erc20TestToken.address);
            expect(await presale.connect(owner).presaleAmount()).to.be.equal("1000000000000");
            expect(await presale.connect(owner).softCap()).to.be.equal(ethers.utils.parseUnits("0.01", "ether")).toString();
            expect(await presale.connect(owner).maxContribution()).to.be.equal(ethers.utils.parseUnits("0.001", "ether")).toString();
            expect(await presale.connect(owner).start()).to.be.equal(now + 1000);
            expect(await presale.connect(owner).end()).to.be.equal(now + 2 * 60 * 1000);
            expect(await presale.connect(owner).maxContribution()).to.be.equal(ethers.utils.parseUnits("0.001", "ether").toString());

        });

        it("Test set white list", async function () {
            expect(presale.address).to.be.equal(proxy.address);

            await expect(presale.connect(addr1).enableWhitelist(true)).to.be.reverted;
            await expect(presale.connect(addr1).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.reverted;

            await expect(presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.reverted;

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;

        });

        it("Test buy tokens", async function () {
            expect(presale.address).to.be.equal(proxy.address);
            
            await expect(presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.reverted;

            // Set the next block timestamp
            await nextBlock(1001);

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;
            expect(await presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(addr2).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("500000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(2);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.002", "ether").toString());

        });

        it("Test emergencyWithdraw", async function () {
            
            expect(presale.address).to.be.equal(proxy.address);
            
            await expect(presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.reverted;
            
            // Set the next block timestamp
            await nextBlock(1001);

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;
            expect(await presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(addr2).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("500000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(2);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.002", "ether").toString());

            expect(await presale.connect(addr1).emergencyWithdraw()).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("1000000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(1);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.001", "ether").toString());

        });

        it("Test claimToken", async function () {
            
            expect(presale.address).to.be.equal(proxy.address);
            
            await expect(presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.reverted;
            
            // Set the next block timestamp
            await nextBlock(1001);

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;
            expect(await presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(addr2).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("500000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(2);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.002", "ether").toString());

            // Set the next block timestamp
            await nextBlock(2 * 60 * 1000);

            expect(await presale.connect(owner).setSoftCap(ethers.utils.parseUnits("0.002", "ether").toString())).to.be.ok;
            expect(await presale.connect(addr1).claimToken()).to.be.ok;
            expect(await erc20TestToken.balanceOf(addr1.address)).to.be.equal("500000000000")

        });

        it("Test claimEth", async function () {
            
            expect(presale.address).to.be.equal(proxy.address);
            
            await expect(presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.reverted;

            // Set the next block timestamp
            await nextBlock(1001);

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;
            expect(await presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(addr2).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("500000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(2);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.002", "ether").toString());

            // Set the next block timestamp
            await nextBlock(2 * 60 * 1000);

            const addr2Balance = await ethers.provider.getBalance(addr2.address);

            const claimEthTx = await presale.connect(addr2).claimEth();
            expect(claimEthTx).to.be.ok;

            const weiCost = await getWeiCost(claimEthTx);

            expect(await ethers.provider.getBalance(addr2.address)).to.be.equal(addr2Balance.add(ethers.utils.parseUnits("0.001", "ether")).sub(weiCost));
        });

        it("Test withdrawEth", async function () {

            expect(presale.address).to.be.equal(proxy.address);

            await expect(presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.reverted;
            
            // Set the next block timestamp
            await nextBlock(1001);

            expect(await presale.connect(owner).enableWhitelist(true)).to.be.ok;
            expect(await presale.connect(owner).setWhitelist([addr1.address, addr2.address], [true, true])).to.be.ok;
            expect(await presale.connect(addr1).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(addr2).buy({ value: ethers.utils.parseUnits("0.001", "ether").toString() })).to.be.ok;
            expect(await presale.connect(owner).getTokenAmount(ethers.utils.parseUnits("0.001", "ether").toString())).to.be.equal("500000000000");
            expect(await presale.connect(owner).contributors()).to.be.equal(2);
            expect(await presale.connect(owner).weiRaised()).to.be.equal(ethers.utils.parseUnits("0.002", "ether").toString());

            // Set the next block timestamp
            await nextBlock(2 * 60 * 1000);

            const ownerBalance = await ethers.provider.getBalance(owner.address);

            const claimEthTx = await presale.connect(owner).withdrawEth();
            expect(claimEthTx).to.be.ok;

            const weiCost = await getWeiCost(claimEthTx);

            expect(await ethers.provider.getBalance(owner.address)).to.be.equal(ownerBalance.add(await presale.weiRaised()).sub(weiCost));
        });
    });

})