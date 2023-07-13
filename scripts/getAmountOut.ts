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
    const abi = require("../syncswap-abi/SyncSwapClassicPool.json")
    const pool = new Contract("0x768d6EE2E65b1c4Eb948d40a8196BC243Bcb967f", abi, wallet)

    let sender = "0x0000000000000000000000000000000000000000"
    let tokenIn = "0x20b28B1e4665FFf290650586ad76E977EAb90c5D"
    let amountIn = ethers.utils.parseEther("0.0001")

    let tx = await pool.getAmountOut(
        tokenIn,
        amountIn,
        sender
    )

    console.log(tx.toString());

}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });