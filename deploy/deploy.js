const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const name = "TestToken1";
    const symbol = "TT1";
    const decimal = 18;

    const Token = await ethers.getContractFactory("ERC20TestToken");
    token = await Token.deploy(name, symbol, decimal)

    console.log("Deployed to:", token.address);
}

main()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
