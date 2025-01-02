import { ethers, network } from "hardhat";
import { MINT_PARAMS } from "./mintParams";

// npx hardhat run scripts/deploy.ts --network metis
deploy();
async function deploy() {
  const toasterItems_f = await ethers.getContractFactory("ToasterItems");
  const params = MINT_PARAMS(network.config.chainId!);
  const toasterItems = await toasterItems_f.deploy(
    params.NAME,
    params.PROFILE_NAME,
    params.SYMBOL,
    params.ITEM_URL,
    params.PROFILE_URL,
    params.MINT_CAP
  );
  await toasterItems.waitForDeployment();

  console.log({
    ToasterItems: await toasterItems.getAddress(),
    ToasterProfile: await toasterItems.profileNft(),
    chainId: network.config.chainId,
  });
}
