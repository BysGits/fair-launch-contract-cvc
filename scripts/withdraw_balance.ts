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

    let pool = "0x310508442b4f18B009D62c45b7c097333f7634c5"
    let liquidity = ethers.utils.parseEther("100").toString()
    let data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [wallet.address, "1"]
    )
    // "0x00000000000000000000000017a9c4d8b1c771d7bacdc4414eb73131e9909c7f0000000000000000000000000000000000000000000000000000000000000001"
    let minAmounts = [BigNumber.from("0").toString(), BigNumber.from("0").toString()]
    let callback = "0x0000000000000000000000000000000000000000"
    let callbackData = "0x"

    let tx = await router.burnLiquidity(
        pool,
        liquidity,
        data,
        minAmounts,
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