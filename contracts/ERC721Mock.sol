pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Mock is ERC721URIStorage, Ownable {
  uint256 public tokenCounter;

  constructor() ERC721("MyNFT", "NFT") Ownable(msg.sender) {
    tokenCounter = 0;
  }

  function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
    uint256 newTokenId = tokenCounter;
    _safeMint(recipient, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    tokenCounter++;
    return newTokenId;
  }
}