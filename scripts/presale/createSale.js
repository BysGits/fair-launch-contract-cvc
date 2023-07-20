const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

var getCurrentTime = async (contract) => {
    var currentTime = (await contract.getBlockTimestamp()).toNumber()
    return currentTime
}

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.attach(process.env.CONTROLLER_ADDRESS_TESTNET)
    await controller.deployed()

    var startTime = await getCurrentTime(controller) + 100
    var endTime = startTime + 10000000

    console.log(startTime);

    var tokenAddress = "0x989b5386E31415A88eCbcEcDd7c8f4cCBEbDf2a7"

    var data = [
        18, 
        "1000000000000000000000000", 
        "200000000000000000",
        startTime,
        endTime,
        "10000000000000000000",
        "1000000000000000",
        "10000"
    ]
    var addr = [tokenAddress, process.env.CONTROLLER_ADDRESS_TESTNET]
    var bool = [false]
    var str = ["0x13"]

    // const ERC20TestToken = await ethers.getContractFactory("ERC20TestToken");
    // var token = await ERC20TestToken.attach(tokenAddress)
    // await token.deployed()

    // var tx = await token.approve(
    //     process.env.CONTROLLER_ADDRESS_TESTNET,
    //     data[1]
    // )

    // await tx.wait()

    tx = await controller.createSale(
        data,
        addr,
        bool,
        str
    )
    await tx.wait()

    console.log("Done");
}

main()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
