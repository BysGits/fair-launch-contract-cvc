import { Wallet, Contract, Web3Provider, Provider} from "zksync-web3";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// An example of a deploy script that will deploy and call a simple contract.
async function main() {
    const provider = new Provider('https://testnet.era.zksync.dev');

    // Initialize the wallet.
    const wallet = new Wallet("0x7d7f817ef44622750870b89e3db7218fc6c438e7ec9a3b36328d9745371aca18", provider);

    // Create deployer object and load the artifact of the contract you want to deploy.
    const abi = require("../artifacts-zk/contracts/ERC20TestToken.sol/ERC20TestToken.json")
    const token = new Contract("0x60bc26632bBf81b5474c55109E034F6883390783", abi.abi, wallet)

    let tx = await token.mint("0x17A9c4d8b1C771D7bACDc4414Eb73131E9909C7F", "10000000000000000000000")
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