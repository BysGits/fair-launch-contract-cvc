import { Wallet, Contract, Web3Provider, Provider } from "zksync-web3";
import { ethers } from "ethers";
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
    const abi = require("../../artifacts-zk/contracts/fair-launch/Presale.sol/Presale.json");
    if (process.env.PROXY_ADDRESS) {
        const contract = new Contract(
            process.env.PROXY_ADDRESS,
            abi.abi,
            wallet
        );

        let tx = await contract.buy({
            value: ethers.utils.parseUnits("0.00001", "ether").toString(),
        });

        console.log(tx);

        console.log(
            await contract.token(),
            (await contract.presaleAmount()).toString(),
            (await contract.weiRaised()).toString(),
            await contract.hasWhitelist(),
            (await contract.start()).toString(),
            (await contract.end()).toString(),
            (await contract.getBlockTimestamp()).toString(),
            (await contract.maxContribution()).toString(),
            (await contract.softCap()).toString()
        );
    }
}

main()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
