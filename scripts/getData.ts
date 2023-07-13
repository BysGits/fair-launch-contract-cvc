import { Provider } from "zksync-web3";

async function main() {
    // const provider = new Provider("https://testnet.era.zksync.dev");
    const provider = new Provider("https://mainnet.era.zksync.io")

    // console.log(await provider.getMainContractAddress());

    // console.log(await provider.getTestnetPaymasterAddress());

    // console.log(await provider.getConfirmedTokens(0, 255));

    console.log(await provider.getTokenPrice("0xc2b13bb90e33f1e191b8aa8f44ce11534d5698e3"));
}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
