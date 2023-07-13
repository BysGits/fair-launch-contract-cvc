import { Wallet, Contract, Web3Provider, Provider} from "zksync-web3";
import { BigNumber, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    const provider = new Provider('https://testnet.era.zksync.dev');

    // Initialize the wallet.
    const wallet = new Wallet("0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18", provider);
    const abi = require("../syncswap-abi/SyncSwapClassicPool.json")
    const pool = new Contract("0x3aEF833016B83a3993e780cf62e526F7F57A435D", abi, wallet)


    let tx = await pool.getReserves()

    console.log(ethers.utils.formatEther(tx[0]));
    console.log(ethers.utils.formatEther(tx[1]));

}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });