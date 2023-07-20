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

    const Sale = await ethers.getContractFactory("Presale");
    sale = await Sale.attach("0xc89E6024383354fDc23E1B7d94928E6787E640c8")
    await sale.deployed()

    var endTime = await getCurrentTime(sale) + 1000000

    var tx = await sale.setEndTime(endTime)
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
