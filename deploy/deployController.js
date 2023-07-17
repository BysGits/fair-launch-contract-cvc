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
    proxy = await Proxy.deploy(controller.address);
    await proxy.deployed()
    console.log("Proxy deployed to: ", proxy.address);

    controller = await Controller.attach(proxy.address)
    await controller.deployed()

    var tx = await controller.setFee(process.env.FEE)
    await tx.wait()

    tx = await controller.setRouter(process.env.ROUTER_ADDRESS_TESTNET)
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
