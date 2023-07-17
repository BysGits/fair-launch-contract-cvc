const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.attach(process.env.CONTROLLER_ADDRESS_TESTNET)
    await controller.deployed()

    var tx = await controller.launchAddress("0x11")
    console.log(tx);

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
