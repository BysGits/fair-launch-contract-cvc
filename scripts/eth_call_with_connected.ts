import { BigNumber, providers, ethers } from "ethers";
import { writeFileSync } from "fs";
import { utils } from 'zksync-web3';
(async () => {
  const provider = new providers.JsonRpcProvider("https://testnet.era.zksync.dev");

  const token = "0x20b28B1e4665FFf290650586ad76E977EAb90c5D"
  // const amount = BigNumber.from("269775537484041835").toHexString()
  const amount = ethers.utils.parseEther("1").toString()
  console.log(amount);

  const data = "0x6db7b2f5000000000000000000000000f2fd2bc2fbc12842aab6fbb8b1159a6a83e72006000000000000000000000000b6a70d6ab2de494592546b696208aceec18d755f".concat(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [token, amount]
    ).slice(2)
  ).concat("000000000000000000000000fced12debc831d3a84931c63687c395837d42c2b00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000020b28b1e4665fff290650586ad76e977eab90c5d")

  // console.log(data);

  const response = await provider.send("eth_call", [
    {
      "from": null,
      "to": "0x3cd8726d738340b8d046bdcedd4b95741148581b",
      "data": data,
    },
    "latest",
  ]);
  writeFileSync(
    "./output/rep2.txt",
    response
  );
})();
