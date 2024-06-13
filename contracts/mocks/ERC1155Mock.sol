pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Mock is ERC1155, Ownable {
    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function burn(address from, uint256 id, uint256 amount) public onlyOwner {
        _burn(from, id, amount);
    }

    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        _burnBatch(from, ids, amounts);
    }
}