import { Wallet, Contract, Web3Provider, Provider} from "zksync-web3";
import { BigNumber, ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
require("dotenv").config();


// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    const provider = new Provider('https://testnet.era.zksync.dev');

    // Initialize the wallet.
    const wallet = new Wallet("0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18", provider);

    // Create deployer object and load the artifact of the contract you want to deploy.
    const abi = require("../syncswap-abi/SyncSwapRouter.json")
    const abi_pool = require("../syncswap-abi/SyncSwapClassicPool.json")
    const router = new Contract("0xB3b7fCbb8Db37bC6f572634299A58f51622A847e", abi, wallet)

    let pool = '0x768d6EE2E65b1c4Eb948d40a8196BC243Bcb967f'
    const pool_contract = new Contract(pool, abi_pool, wallet)
    let tokenIn = "0x20b28B1e4665FFf290650586ad76E977EAb90c5D"
    let eth_addr = "0x0000000000000000000000000000000000000000"

    let data = ethers.utils.defaultAbiCoder.encode(
      ["address","address","uint256"],
      [tokenIn,wallet.address,"2"]
    )

    // console.log(data);
      // "0x000000000000000000000000a561fa6131adbfd7585a6ca72eb551dca728a2e800000000000000000000000017a9c4d8b1c771d7bacdc4414eb73131e9909c7f0000000000000000000000000000000000000000000000000000000000000002"
    let callback = process.env.CALLBACK_ADDRESS_TESTNET
    let callbackData = "0x"
    let amountIn = ethers.utils.parseEther("0.0001").toString()
    let sender = "0x0000000000000000000000000000000000000000"
    
    let amountOut = await pool_contract.getAmountOut(
      tokenIn,
      amountIn,
      sender
    )
    let amountOutMin = amountOut.mul(3).div(1000).toString()
    let deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 5000).toString()


    let tx = await router.swap(
        [[[[pool,data,callback,callbackData]],eth_addr,amountIn]],amountOutMin,deadline,
        { value: amountIn }
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