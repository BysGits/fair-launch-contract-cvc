import { Wallet, Contract, Web3Provider, Provider } from "zksync-web3";
import { BigNumber, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    const provider = new Provider("https://testnet.era.zksync.dev");

    // Initialize the wallet.
    const wallet = new Wallet(
        "0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18",
        provider
    );

    // Create deployer object and load the artifact of the contract you want to deploy.
    const abi = require("../artifacts-zk/contracts/ERC20TestToken.sol/ERC20TestToken.json");
    const token = new Contract(
        "0xb09615EA564c93bA8932Bf2d1CB7F9A944B80804",
        abi.abi,
        wallet
    );

    let tx = await token.approve(
        "0x93D3E4B048aDaCf83EB170bd544D41EeB09C88b7",
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    );
    await tx.wait();

    console.log(tx);
}

main()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
