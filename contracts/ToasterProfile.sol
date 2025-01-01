// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToasterItems} from "./interfaces/IToasterItems.sol";
import "./types/Attribute.sol";

contract ToasterProfile is ERC721Enumerable, Ownable {
    using AttributeLib for uint256;
    using AttributeLib for Attribute;

    /************************ STATE ************************/
    IToasterItems public immutable toasterItems;
    uint256 public profileId;
    string public profileUrl;
    uint256 public mintCap; // 최대 발행 수 제한

    /************************ EVENT ************************/
    event MintProfile(uint256 indexed profileId, uint256[] items);
    event MintCapUpdated(uint256 newCap);

    constructor(
        string memory name,
        string memory symbol,
        string memory _profileUrl,
        address _owner,
        uint256 _mintCap
    ) ERC721(name, symbol) Ownable(_owner) {
        profileUrl = _profileUrl;
        toasterItems = IToasterItems(msg.sender);
        mintCap = _mintCap;
    }

    function mintProfile(uint256[] memory items) external {
        require(profileId < mintCap, "Mint cap reached"); // 발행 수 확인
        profileId++;
        _mint(msg.sender, profileId);
        toasterItems.useItems(msg.sender, items);
        emit MintProfile(profileId, items);
    }

    /************************ CONFIG ************************/
    function setProfileUrl(string memory _profileUrl) external onlyOwner {
        require(owner() == msg.sender, "Only Owner can set the profile url");
        profileUrl = _profileUrl;
    }

    function setMintCap(uint256 _newCap) external onlyOwner {
        require(
            _newCap > profileId,
            "New cap must be greater than current minted NFTs"
        );
        mintCap = _newCap;
        emit MintCapUpdated(_newCap);
    }

    /************************ INTERNAL ************************/
    function _baseURI() internal view override returns (string memory) {
        return profileUrl;
    }
}
