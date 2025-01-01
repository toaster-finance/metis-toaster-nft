import { expect } from "chai";
import { ethers } from "hardhat";
import {
  ToasterItems,
  ToasterProfile,
  ToasterProfile__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { signToBatchMint, signToMint } from "./utils/sign";

describe("ToasterItems", function () {
  let chainId: bigint;
  let toasterItems: ToasterItems;
  let toasterProfile: ToasterProfile;
  let owner: SignerWithAddress;
  let resolver: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  const ITEM0 = 0x0100;
  const ITEM1 = 0x0301;
  const ITEM2 = 0x0502;
  const INVALID_ITEM = 0x0703; // total attribute is 3
  before(async function () {
    [owner, resolver, user1, user2] = await ethers.getSigners();
    // Set Chain Id
    chainId = await ethers.provider
      .getNetwork()
      .then((network) => network.chainId);
    // Deploy the toaster items and profile nft contract
    const ToasterItemsFactory = await ethers.getContractFactory(
      "ToasterItems",
      owner
    );
    toasterItems = await ToasterItemsFactory.deploy(
      "ToasterItems",
      "ToasterProfile",
      "TI",
      "itemUrl",
      "profileUrl",
      2
    );
    await toasterItems.waitForDeployment();
    const toasterProfileAddr = await toasterItems.profileNft();
    toasterProfile = ToasterProfile__factory.connect(toasterProfileAddr, owner);

    // Allow the resolver  mint the items
    await toasterItems.setResolvers([resolver], [true]);

    // Set Total Attributes
    await toasterItems.setTotalAttributes(
      3,
      [0x00, 0x01, 0x02],
      [true, true, false]
    );

    // Set Attribute Optianal
    await toasterItems.setAttributesOptional(
      [0x00, 0x01, 0x02],
      [false, true, false]
    );

    expect(await toasterItems.profileNft()).to.equal(
      await toasterProfile.getAddress()
    );
  });

  it("Mint an single item", async function () {
    const itemId1 = ITEM0;
    const itemId2 = ITEM1;
    const revertItemId = INVALID_ITEM;
    const revertedResolver = user2;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

    // Mint a sigle item(itemid: 0x1)
    let { v, r, s } = await signToMint(
      toasterItems,
      chainId,
      resolver,
      user1.address,
      itemId1,
      deadline
    );
    await toasterItems
      .connect(user1)
      .mint(itemId1, deadline, resolver, v, r, s);
    expect(await toasterItems.balanceOf(user1.address, itemId1)).to.equal(1);

    // Mint a sigle item(itemid: 0x2)
    ({ v, r, s } = await signToMint(
      toasterItems,
      chainId,
      resolver,
      user1.address,
      itemId2,
      deadline
    ));
    await toasterItems
      .connect(user1)
      .mint(itemId2, deadline, resolver, v, r, s);
    expect(await toasterItems.balanceOf(user1.address, itemId2)).to.equal(1);

    // Failed to mint a sigle item(invalid attribute)
    ({ v, r, s } = await signToMint(
      toasterItems,
      chainId,
      resolver,
      user1.address,
      revertItemId,
      deadline
    ));
    await expect(
      toasterItems
        .connect(user1)
        .mint(revertItemId, deadline, resolver, v, r, s)
    ).to.be.revertedWith("Invalid Attribute");

    // Failed to mint with wrong resolver
    ({ v, r, s } = await signToMint(
      toasterItems,
      chainId,
      revertedResolver,
      user1.address,
      itemId1,
      deadline
    ));
    await expect(
      toasterItems
        .connect(user1)
        .mint(itemId1, deadline, revertedResolver, v, r, s)
    ).to.be.revertedWith("Allowed resolver need");
  });

  it("Mint multiple items in a batch", async function () {
    const items = [ITEM0, ITEM1, ITEM2];
    const revertedItemId = INVALID_ITEM;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

    // Batch Mint
    let { v, r, s } = await signToBatchMint(
      toasterItems,
      chainId,
      resolver,
      user2.address,
      items,
      deadline
    );
    await toasterItems
      .connect(user2)
      .mintBatch(items, deadline, resolver, v, r, s);
    expect(await toasterItems.balanceOf(user2.address, items[0])).to.equal(1);
    expect(await toasterItems.balanceOf(user2.address, items[1])).to.equal(1);
    expect(await toasterItems.balanceOf(user2.address, items[2])).to.equal(1);

    // Batch Mint With
    ({ v, r, s } = await signToBatchMint(
      toasterItems,
      chainId,
      resolver,
      user2.address,
      items,
      deadline
    ));
    await toasterItems
      .connect(user2)
      .mintBatch(items, deadline, resolver, v, r, s);
    
    expect(await toasterItems.balanceOf(user2.address, items[0])).to.equal(2);
    expect(await toasterItems.balanceOf(user2.address, items[1])).to.equal(2);
    expect(await toasterItems.balanceOf(user2.address, items[2])).to.equal(2);

    // Failed to mint a sigle item(invalid attribute)
    const revertedItems = items.concat(revertedItemId);
    ({ v, r, s } = await signToBatchMint(
      toasterItems,
      chainId,
      resolver,
      user2.address,
      revertedItems,
      deadline
    ));
    expect(
      toasterItems
        .connect(user2)
        .mintBatch(revertedItems, deadline, resolver, v, r, s)
    ).to.be.revertedWith("Invalid Attribute");
  });

  it("Mint Toaster Profile", async function () {
    const items = [ITEM0, ITEM1, ITEM2];
    await expect(
      toasterItems.connect(user2).useItems(user2.address, items)
    ).to.be.revertedWith("Burn Only By ToasterProfile");
    expect(await toasterItems.balanceOf(user2.address, items[0])).to.equal(2);
    expect(await toasterItems.balanceOf(user2.address, items[1])).to.equal(2);
    expect(await toasterItems.balanceOf(user2.address, items[2])).to.equal(2);
    // Mint profile
    await toasterProfile.connect(user2).mintProfile(items);
    expect(await toasterItems.balanceOf(user2.address, items[0])).to.equal(1);
    expect(await toasterItems.balanceOf(user2.address, items[1])).to.equal(1);
    expect(await toasterItems.balanceOf(user2.address, items[2])).to.equal(1);

    // Failed to mint profile
    await expect(
      toasterProfile.connect(user2).mintProfile([items[0], items[1]])
    ).to.be.revertedWithCustomError(toasterItems, "LengthMismatch");

    // Failed to mint profile
    await expect(
      toasterProfile.connect(user2).mintProfile([items[0], items[1], 0])
    ).to.be.revertedWith("Non-selectable Item");

    // Mint Profile only with selectable items
    await toasterProfile.connect(user2).mintProfile([items[0], 0, items[2]]);
    expect(await toasterItems.balanceOf(user2.address, items[0])).to.equal(0);
    expect(await toasterItems.balanceOf(user2.address, items[1])).to.equal(1);
    expect(await toasterItems.balanceOf(user2.address, items[2])).to.equal(0);
  });
});
