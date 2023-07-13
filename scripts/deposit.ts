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
    let tokenA = "0x35C9CD04C4Dc57233D8ae88C62E3eb0175E07153"
    let amountA = BigNumber.from("0x021e19e0c9bab2400000").toString()
    let tokenB = "0xb09615EA564c93bA8932Bf2d1CB7F9A944B80804"
    let amountB = BigNumber.from("0x065a4da25d3016c00000").toString()
    let data = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [wallet.address]
    )
    let minLiquidity = BigNumber.from("0x03a18ea1e795eacee5c2").toString()
    let callback = "0x0000000000000000000000000000000000000000"
    let callbackData = "0x"

    let tx = await router.addLiquidity2(
        pool,
        [
            [
                tokenA,
                amountA
            ],
            [
                tokenB,
                amountB
            ],
        ],
        data,
        minLiquidity,
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