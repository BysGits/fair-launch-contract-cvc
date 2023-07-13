import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
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
    const artifact = await deployer.loadArtifact("UniswapV2Router02");
    const deploymentFee = await deployer.estimateDeployFee(artifact, [
        process.env.FACTORY_ADDRESS,
        process.env.WETH_TESTNET
    ]);

    // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
    // `greeting` is an argument for contract constructor.
    const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
    console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

    const router = await deployer.deploy(artifact, [
        process.env.FACTORY_ADDRESS,
        process.env.WETH_TESTNET
    ]);

    // Show the contract info.
    const contractAddress = router.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}
