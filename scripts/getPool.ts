import { Wallet, Contract, Web3Provider, Provider} from "zksync-web3";
import { BigNumber, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    const provider = new Provider('https://testnet.era.zksync.dev');

    // Initialize the wallet.
    const wallet = new Wallet("0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18", provider);

    // Create deployer object and load the artifact of the contract you want to deploy.
    const abi = require("../syncswap-abi/SyncSwapClassicPoolFactory.json")
    const factory = new Contract("0xf2FD2bc2fBC12842aAb6FbB8b1159a6a83E72006", abi, wallet)

    let tokenA = "0x35C9CD04C4Dc57233D8ae88C62E3eb0175E07153"
    let tokenB = "0xb09615EA564c93bA8932Bf2d1CB7F9A944B80804"

    let tx = await factory.getPool(
        tokenA,
        tokenB
    )

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