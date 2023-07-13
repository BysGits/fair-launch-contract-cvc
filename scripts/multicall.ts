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
    const abi = require("../artifacts-zk/contracts/Multicall.sol/Multicall.json");
    const tokenAbi = require("../artifacts-zk/contracts/ERC20TestToken.sol/ERC20TestToken.json")
    const contract = new Contract(
        "0x5018Ef0C3Ce556Da5CD7fc907E5354a646Ee0771",
        abi.abi,
        wallet
    );

    let amount = ethers.utils.parseEther("1000000").toString()
    let to = "0x6A965aE0925d4e37EC4545a7B65819aA9e91961d"

    let iface = new ethers.utils.Interface(tokenAbi.abi)
    let data1 = iface.getSighash("transfer").concat(
        ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256"],
            [to, amount]
        ).slice(2)
    )

    let data2 = iface.getSighash("balanceOf").concat(
        ethers.utils.defaultAbiCoder.encode(
            ["address"],
            [to]
        ).slice(2)
    )

    console.log(data2);


    // let tx = await contract.multicall([
    //     [
    //         "0xb09615EA564c93bA8932Bf2d1CB7F9A944B80804",
    //         "2000000000000000000000000",
    //         data1
    //     ]
    // ]);
    // await tx.wait();

    // console.log(tx);
}

main()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
