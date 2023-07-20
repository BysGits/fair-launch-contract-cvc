const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Sale = await ethers.getContractFactory("Presale");
    sale = await Sale.attach("0x58c0Ba2d42125dD41D0294E84844BA7902F73E40")
    await sale.deployed()

    var tx = await sale.claimXCR()
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
