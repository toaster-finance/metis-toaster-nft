export function MINT_PARAMS(
  chainId: number
) {
  // TODO: SET CONST
  const NAME = "Toaster Items";
  const PROFILE_NAME = "Toaster Profiles";
  const SYMBOL = "TOASTER";

  const ITEM_URL = `https://api.toaster.finance/api/v1/nft/${chainId}/items/`;
  const PROFILE_URL = `https://api.toaster.finance/api/v1/nft/${chainId}/profiles/`;
  const MINT_CAP = 1000;
  return {
    NAME,
    PROFILE_NAME,
    SYMBOL,
    ITEM_URL,
    PROFILE_URL,
    MINT_CAP,
  };
}
