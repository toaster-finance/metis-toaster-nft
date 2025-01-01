import { ethers, network } from "hardhat";
import { CONFIGS } from "./configs";

// yarn set-resolver --network metis
setResolver();
async function setResolver() {
  const chainId = network.config.chainId! as keyof typeof CONFIGS;
  const config = CONFIGS[chainId];

  const [, resolver] = await ethers.getSigners();
  const resolverAddress = await resolver.getAddress();

  const ItemCtrt = await ethers.getContractAt("ToasterItems", config.item);
  const tx = await ItemCtrt.setResolvers([resolverAddress], [true]);
  await tx.wait();

  const ok = await ItemCtrt.isResolver(resolverAddress);

  if (ok) {
    console.log("Resolver set to:", resolverAddress);
  } else {
    console.log("Failed to set resolver");
  }
}
