const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const Token = await ethers.getContractFactory("UniswapV2Factory");
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