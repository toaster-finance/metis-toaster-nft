interface ToasterNFTConfig {
  ToasterItems: string;
  ToasterProfile: string;
  resolvers: string[];
  attributes: number;
  optionals: {
    ids: number[];
    isOptional: boolean[];
  };
}

export const CONFIGS: Record<number, ToasterNFTConfig> = {
  1088: {
    ToasterItems: "0x642C2c5BF941D5eb93C4935ee84e82A37428a27d",
    ToasterProfile: "0x7272C28fEf7903704B9665530eb30d7c797Ff86d",
    resolvers: ["0x8888077Eb2d3C577E9653bf22A1478Cd35C7eFA9"],
    attributes: 4,
    optionals: {
      ids: [0, 1, 2, 3],
      isOptional: [false, false, false, true],
    },
  },
  // Hardhat testnet
  31337: {
    ToasterItems: "",
    ToasterProfile: "",
    resolvers: [""],
    attributes: 4,
    optionals: {
      ids: [0, 1, 2, 3],
      isOptional: [false, false, false, true],
    },
  },
};
