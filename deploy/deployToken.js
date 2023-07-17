const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    [deployer] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Balance: ${(await deployer.getBalance()).toString()}`);

    const name = "TestToken1"
    const symbol = "TT1"
    const decimal = 18
    const inital_supply = ethers.utils.parseEther("1").toString()

    const ERC20TestToken = await ethers.getContractFactory("ERC20TestToken");
    token = await ERC20TestToken.deploy(
        name,
        symbol,
        decimal,
        inital_supply
    )
    await token.deployed()
    console.log("Token Deployed to: ", token.address);

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
