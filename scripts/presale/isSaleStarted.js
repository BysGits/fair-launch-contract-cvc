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

    var tx = await sale.isSaleStarted()
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
