import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";
dotenv.config();

const DUMMY_PRIVATE_KEY =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 31337,
    },
    metis: {
      chainId: 1088,
      url: "https://andromeda.metis.io/?owner=1088",
      accounts: [
        process.env.DEPLOY_MAINNET || DUMMY_PRIVATE_KEY,
        process.env.RESOLVER || DUMMY_PRIVATE_KEY,
      ],
    },
  },
  solidity: "0.8.28",
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
