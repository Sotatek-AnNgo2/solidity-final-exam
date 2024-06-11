import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { ERC721Mock__factory } from '../../typechain';

async function mintNFT(mintFor?: string) {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const deployed = readData();
  const contractAddress = deployed.ERC721Mock; // Replace with your deployed contract address

  const contract = ERC721Mock__factory.connect(contractAddress, deployer);

  const recipient = mintFor ?? seller.address; // Use the deployer's address or any other address
  const tokenURI = 'ipfs://Qm...'; // Replace with your IPFS URI

  const tx = await contract.mintNFT(recipient, tokenURI);
  const receipt = await tx.wait();

  const event = receipt?.logs.find(event => (event as any).fragment.name === 'Transfer')
  const [from, to, tokenId] = (event as any).args;


  const result = { tx: tx.hash, from, to, tokenId }
  console.log(result);

  return result
}

mintNFT().catch(console.error);
