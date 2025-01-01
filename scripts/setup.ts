import { ethers, network } from "hardhat";
import { CONFIGS } from "./configs";

// yarn setup:metis
main().catch((error) => {
  console.error("Error in setup:", error);
  process.exitCode = 1;
});

async function main() {
  try {
    const chainId = network.config.chainId! as keyof typeof CONFIGS;
    const config = CONFIGS[chainId];

    console.log("Setting up contracts on chain:", chainId);

    const itemCtrt = await ethers.getContractAt("ToasterItems", config.item);
    const profileCtrt = await ethers.getContractAt(
      "ToasterProfile",
      config.profile
    );

    console.log("Setting total attributes...");
    const tx = await itemCtrt.setTotalAttributes(
      config.setup.attributes,
      [...config.setup.optionals.ids],
      [...config.setup.optionals.isOptional]
    );
    await tx.wait();

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
}
