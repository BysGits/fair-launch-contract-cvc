const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.deploy()
    await controller.deployed()
    console.log("Impl Deployed to: ", controller.address);

    const Proxy = await ethers.getContractFactory("Proxy");
    proxy = await Proxy.attach(process.env.CONTROLLER_ADDRESS_TESTNET);
    await proxy.deployed()

    var tx = await proxy.upgradeTo(controller.address)
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
