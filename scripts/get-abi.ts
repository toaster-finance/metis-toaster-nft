import fs from "fs-extra";
import { artifacts } from "hardhat";

async function getAbi() {
  const abiFilter = (res: any[]) =>
    res
      .filter((a) => a.type === "function" || a.type === "event")
      .filter(
        (a) =>
          ![
            "transferOwnership",
            "pause",
            "unpause",
            "setAttributesOptional",
            "setItemUrl",
            "renounceOwnership",
            "paused",
            "Paused",
            "isApprovedForAll",
            "EIP712DomainChanged",
          ].includes(a.name)
      );

  const itemsABI = await artifacts
    .readArtifact("ToasterItems")
    .then((a) => a.abi)
    .then(abiFilter);

  const profileABI = await artifacts
    .readArtifact("ToasterProfile")
    .then((a) => a.abi)
    .then(abiFilter);

  if (!fs.existsSync("abi")) {
    fs.mkdirSync("abi");
  }
  fs.writeFileSync("abi/ToasterItems.json", JSON.stringify(itemsABI, null, 2));
  fs.writeFileSync(
    "abi/ToasterProfile.json",
    JSON.stringify(profileABI, null, 2)
  );
}
getAbi();
// npx hardhat run scripts/get-abi.ts
