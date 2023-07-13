import { Wallet, utils } from "zksync-web3";
import { BigNumber, ethers } from "ethers";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
require("dotenv").config();


// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script for the Multicall contract`);

    // Initialize the wallet.
    const wallet = new Wallet(
        "0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18"
    );

    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact("GovernorBravoDelegator");
    const deploymentFee = await deployer.estimateDeployFee(artifact, [
        "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",   // timelock
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",   // uni
        "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",   // admin (Timelock)
        "0x53a328F4086d7C0F1Fa19e594c9b842125263026",   // implementation
        "40320",                                        // votingPeriod
        "13140",                                        // votingDelay
        "2500000000000000000000000"                     // proposalThreshold
    ]);

    // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
    // `greeting` is an argument for contract constructor.
    const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
    console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

    // const contract = await deployer.deploy(artifact, [
    //     process.env.FACTORY_ADDRESS,
    //     process.env.WETH_TESTNET
    // ]);

    // // Show the contract info.
    // const contractAddress = contract.address;
    // console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}