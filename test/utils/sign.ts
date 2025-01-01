import { ethers } from "hardhat";
import { ToasterItems } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export async function signToMint(
  itemsContract: ToasterItems,
  chainId: bigint,
  resolver: SignerWithAddress,
  receiver: string,
  itemId: number,
  deadline: number
) {
  const nonce = await itemsContract.nonces(resolver.address);
  const domain = {
    name: "ToasterItems",
    version: "1",
    chainId,
    verifyingContract: await itemsContract.getAddress(),
  };
  const types = {
    Mint: [
      { name: "receiver", type: "address" },
      { name: "itemId", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const value = {
    receiver,
    itemId,
    nonce,
    deadline,
  };
  const signature = await resolver.signTypedData(domain, types, value);
  const { v, r, s } = ethers.Signature.from(signature);

  return { v, r, s };
}

export async function signToBatchMint(
  itemsContract: ToasterItems,
  chainId: bigint,
  resolver: SignerWithAddress,
  receiver: string,
  itemIds: number[],
  deadline: number
) {
  const nonce = await itemsContract.nonces(resolver.address);
  const domain = {
    name: "ToasterItems",
    version: "1",
    chainId,
    verifyingContract: await itemsContract.getAddress(),
  };
  const types = {
    BatchMint: [
      { name: "receiver", type: "address" },
      { name: "itemIds", type: "uint256[]" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const value = {
    receiver,
    itemIds,
    nonce,
    deadline,
  };
  const signature = await resolver.signTypedData(domain, types, value);
  const { v, r, s } = ethers.Signature.from(signature);

  return { v, r, s };
}
