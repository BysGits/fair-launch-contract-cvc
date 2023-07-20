const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const ERC20TestToken = await ethers.getContractFactory("ERC20TestToken");
    token = await ERC20TestToken.attach("0x989b5386E31415A88eCbcEcDd7c8f4cCBEbDf2a7")
    await token.deployed()

    var tx = await token.approve(
        process.env.CONTROLLER_ADDRESS_TESTNET,
        "1000000000000000000000000"
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
