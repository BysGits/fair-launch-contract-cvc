const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Sale = await ethers.getContractFactory("Presale");
    sale = await Sale.attach("0xc89E6024383354fDc23E1B7d94928E6787E640c8")
    await sale.deployed()

    var tx = await sale.token()
    console.log("Token: ", tx);

    tx = await sale.router()
    console.log("Router: ", tx);

    tx = await sale.controller()
    console.log("Controller: ", tx);

    tx = await sale.totalOfContributors()
    console.log("Total of contributors: ", tx);

    tx = await sale.saleAmount()
    console.log("Sale amount: ", tx);

    tx = await sale.totalDeposit()
    console.log("Total deposit: ", tx);

    tx = await sale.softCap()
    console.log("Soft cap: ", tx);

    tx = await sale.maxDeposit()
    console.log("Max deposit: ", tx);

    tx = await sale.minDeposit()
    console.log("Min deposit: ", tx);

    tx = await sale.start()
    console.log("Start: ", tx);

    tx = await sale.end()
    console.log("End: ", tx);

    tx = await sale.lpPercent()
    console.log("LP percent: ", tx);

    tx = await sale.isPoolCreated()
    console.log("Is pool created: ", tx);

    tx = await sale.hasWhitelist()
    console.log("Has white list: ", tx);

    tx = await sale.isInit()
    console.log("Is init: ", tx);

    tx = await sale.contributions(deployer.address)
    console.log("Amount deposit by address ", deployer.address, ": ", tx);

    tx = await sale.getTokenAmount(ethers.utils.parseEther("1").toString())
    console.log("Token amount to get: ", tx);

    tx = await sale.isSaleStarted()
    console.log("Is sale started: ", tx);

    tx = await sale.isSaleEnded()
    console.log("Is sale ended: ", tx);

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
