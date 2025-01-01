// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;
import {ToasterProfile} from "./ToasterProfile.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import "./types/Attribute.sol";

/**
 * @notice The items are categorized based on the suffix of the tokenId.
 * For example, items with suffix 0x01 and 0x02 are considered different types of items.
 */

contract ToasterItems is ERC1155, EIP712, Nonces, Ownable, Pausable {
    using AttributeLib for uint256;
    using AttributeLib for Attribute;

    error LengthMismatch();
    error MintZeroId();
    error AttributeRequired();
    error InvalidResolver(address signer);

    /************************ TYPE HASH ************************/
    bytes32 private constant MINT_TYPEHASH =
        keccak256(
            "Mint(address receiver,uint256 itemId,uint256 nonce,uint256 deadline)"
        );
    bytes32 private constant MINT_BATCH_TYPEHASH =
        keccak256(
            "BatchMint(address receiver,uint256[] itemIds,uint256 nonce,uint256 deadline)"
        );

    /************************ STATE ************************/
    ToasterProfile public profileNft;
    uint8 public totalAttributes;
    mapping(address => bool) public isResolver;
    mapping(Attribute => bool) public isOptional;

    constructor(
        string memory name,
        string memory profileName,
        string memory symbol,
        string memory itemUrl,
        string memory profileUrl,
        uint profileMintCap
    ) ERC1155(itemUrl) Ownable(msg.sender) EIP712(name, "1") {
        profileNft = new ToasterProfile(
            profileName,
            symbol,
            profileUrl,
            msg.sender,
            profileMintCap
        );
    }

    /************************ EXTERNAL ************************/
    function mint(
        uint256 item,
        uint256 deadline,
        address resolver,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external whenNotPaused {
        require(block.timestamp < deadline, "Minting deadline exceeded");
        require(isResolver[resolver], "Allowed resolver need");
        require(item.attribute().lt(totalAttributes), "Invalid Attribute");

        if (item == 0) revert MintZeroId();

        bytes32 structHash = keccak256(
            abi.encode(
                MINT_TYPEHASH,
                msg.sender,
                item,
                _useNonce(resolver),
                deadline
            )
        );
        verifySig(structHash, resolver, v, r, s);
        _mint(msg.sender, item, 1, "");
    }

    /**
     * @notice Resolver should check valid item id before making signature
     */
    function mintBatch(
        uint256[] memory items,
        uint256 deadline,
        address resolver,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external whenNotPaused {
        require(block.timestamp < deadline, "Minting deadline exceeded");
        require(isResolver[resolver], "Allowed resolver need");
        uint256[] memory amounts = new uint256[](items.length);
        for (uint8 i = 0; i < items.length; i++) {
            // prevent mint itemId = 0
            if (items[i] == 0) revert MintZeroId();

            amounts[i] = 1;
            require(
                items[i].attribute().lt(totalAttributes),
                "Invalid Attribute"
            );
        }
        bytes32 structHash = keccak256(
            abi.encode(
                MINT_BATCH_TYPEHASH,
                msg.sender,
                keccak256(abi.encodePacked(items)),
                _useNonce(resolver),
                deadline
            )
        );
        verifySig(structHash, resolver, v, r, s);
        _mintBatch(msg.sender, items, amounts, "");
    }

    function useItems(
        address user,
        uint256[] memory items
    ) external whenNotPaused {
        require(
            msg.sender == address(profileNft),
            "Burn Only By ToasterProfile"
        );
        // require(items.length == totalAttributes, "Invalid number of items");
        if (items.length != totalAttributes) revert LengthMismatch();

        uint256[] memory amounts = new uint256[](items.length);
        for (uint8 attrIdx = 0; attrIdx < items.length; attrIdx++) {
            // Check if the attribute is optional and the item is not provided (represented by 0)
            Attribute attr = items[attrIdx].attribute();
            if (items[attrIdx] != 0) {
                require(attr.eq(attrIdx), "Attribute Mismatch");
                amounts[attrIdx] = 1;
            } else {
                if (!isOptional[uint256(attrIdx).attribute()])
                    revert AttributeRequired();
                amounts[attrIdx] = 0;
            }
        }
        _burnBatch(user, items, amounts);
    }

    /************************ VIEW ************************/
    function uri(uint256 itemId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(super.uri(itemId), Strings.toString(itemId))
            );
    }

    /************************ CONFIG ************************/
    function setTotalAttributes(
        uint8 attributes,
        uint8[] calldata attributeIds,
        bool[] calldata isOptionals
    ) external onlyOwner whenNotPaused {
        totalAttributes = attributes;
        if (attributeIds.length > 0) {
            _setAttributesOptional(attributeIds, isOptionals);
        }
    }

    function setAttributesOptional(
        uint8[] calldata attributeIds,
        bool[] calldata isOptionals
    ) external onlyOwner whenNotPaused {
        _setAttributesOptional(attributeIds, isOptionals);
    }

    function _setAttributesOptional(
        uint8[] memory attributeIds,
        bool[] memory isOptionals
    ) internal {
        if (attributeIds.length != isOptionals.length) revert LengthMismatch();
        for (uint256 i = 0; i < attributeIds.length; i++) {
            isOptional[Attribute.wrap(attributeIds[i])] = isOptionals[i];
        }
    }

    function setItemUrl(
        string memory itemUrl
    ) external onlyOwner whenNotPaused {
        _setURI(itemUrl);
    }

    function setResolvers(
        address[] calldata resolvers,
        bool[] calldata isAllowed
    ) external onlyOwner {
        if (resolvers.length != isAllowed.length) revert LengthMismatch();
        for (uint256 i = 0; i < resolvers.length; i++) {
            isResolver[resolvers[i]] = isAllowed[i];
        }
    }

    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() external whenPaused onlyOwner {
        _unpause();
    }

    /************************ UTIL ************************/
    function verifySig(
        bytes32 structHash,
        address resolver,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view {
        address signer = ECDSA.recover(_hashTypedDataV4(structHash), v, r, s);
        if (signer != resolver) revert InvalidResolver(signer);
    }
}
