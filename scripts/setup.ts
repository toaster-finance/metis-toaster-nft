import { ethers, network } from "hardhat";
import { CONFIGS } from "./configs";

// npx hardhat run scripts/setup.ts --network metis
setUp();
async function setUp() {
  const config = CONFIGS[network.config.chainId!];
  const ToasterItems = await ethers.getContractAt(
    "ToasterItems",
    config.ToasterItems
  );
  const t1 = await ToasterItems.setTotalAttributes(
    config.attributes,
    config.optionals.ids,
    config.optionals.isOptional
  );
  await t1.wait();
  console.log("Attributes set");

  const t2 = await ToasterItems.setResolvers(
    config.resolvers,
    config.resolvers.map(() => true)
  );

  await t2.wait();
  console.log("Resolvers set");
}
