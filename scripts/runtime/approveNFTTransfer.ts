import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { ERC721Mock__factory } from '../../typechain';

async function approveNFTTransfer() {
  const [deployer, seller] = await ethers.getSigners();

  // Read deployed contract data
  const deployed = readData();
  const contractAddress = deployed.ERC721Mock; // Replace with your deployed contract address

  // Wyvern Exchange contract address
  const wyvernExchangeAddress = deployed.wyvernExchangeWithBulkCancellations; // Replace with the actual Wyvern Exchange address

  // Connect to the deployed ERC721Mock contract
  const contract = ERC721Mock__factory.connect(contractAddress, seller);

  // Call setApprovalForAll to approve the Wyvern Exchange contract
  const tx = await contract.setApprovalForAll(wyvernExchangeAddress, true);
  console.log('Approval transaction hash:', tx.hash);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log('NFT transfer approved for Wyvern Exchange');
}

approveNFTTransfer().catch((error) => {
  console.error('Error approving NFT transfer:', error);
  process.exit(1);
});
