import { ethers, network } from "hardhat";

// yarn deploy --network metis

async function main() {
  // TODO: SET CONST
  const NAME = "Toaster Items";
  const PROFILE_NAME = "Toaster Profiles";
  const SYMBOL = "TOASTER";

  const CHAIN_ID = network.config.chainId;
  const ITEM_URL = `https://api.toaster.finance/items/${CHAIN_ID}`;
  const PROFILE_URL = `https://api.toaster.finance/api/v1/nft/${CHAIN_ID}/profiles`;
  const MINT_CAP = 1000;

  const toasterItems_f = await ethers.getContractFactory("ToasterItems");
  const toasterItems = await toasterItems_f.deploy(
    NAME,
    PROFILE_NAME,
    SYMBOL,
    ITEM_URL,
    PROFILE_URL,
    MINT_CAP
  );
  await toasterItems.waitForDeployment();
  console.log("ToasterItemsNFT deployed to:", await toasterItems.getAddress());

  console.log({
    chainId: network.config.chainId,
    item: await toasterItems.getAddress(),
    profile: await toasterItems.profileNft(),
  });
}
// Run the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
