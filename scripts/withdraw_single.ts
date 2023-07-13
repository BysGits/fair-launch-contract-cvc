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
    const abi = require("../syncswap-abi/SyncSwapRouter.json")
    const router = new Contract("0xB3b7fCbb8Db37bC6f572634299A58f51622A847e", abi, wallet)

    let token = "0xb09615EA564c93bA8932Bf2d1CB7F9A944B80804"
    let pool = "0x4981baa60A28428394E6077256560c41e71Afa11"
    let liquidity = ethers.utils.parseEther("1").toString()
    let data = ethers.utils.defaultAbiCoder.encode(
      ["address","address","uint256"],
      [token,wallet.address,"1"]
    )
    // "0x000000000000000000000000a561fa6131adbfd7585a6ca72eb551dca728a2e800000000000000000000000017a9c4d8b1c771d7bacdc4414eb73131e9909c7f0000000000000000000000000000000000000000000000000000000000000001"
    let minAmount = BigNumber.from("0").toString()
    let callback = "0x0000000000000000000000000000000000000000"
    let callbackData = "0x"

    let tx = await router.burnLiquiditySingle(
        pool,
        liquidity,
        data,
        minAmount,
        callback,
        callbackData
    )
    await tx.wait()

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