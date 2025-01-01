export const CONFIGS = {
  1088: {
    item: "0x...", // deployed contract address
    profile: "0x...", // deployed profile address
    setup: {
      attributes: 6,
      optionals: {
        ids: [4, 5],
        isOptional: [true, true],
      },
    },
    deploy: {
      name: "Toaster Items",
      profileName: "Toaster Profiles",
      symbol: "TOASTER",
      itemUrl: "https://api.toaster.finance/items/1088",
      profileUrl: "https://api.toaster.finance/api/v1/nft/1088/profiles",
      mintCap: 1000,
      attributes: 6,
      optionals: {
        ids: [4, 5],
        isOptional: [true, true],
      },
    },
  },
} as const;
