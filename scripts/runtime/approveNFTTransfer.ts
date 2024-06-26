import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { ERC721Mock__factory } from '../../typechain';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

async function approveNftTransfer(signer: HardhatEthersSigner, addressToApprove: string, tokenId: number) {
  const [deployer, seller] = await ethers.getSigners();

  // Read deployed contract data
  const deployed = readData();
  const contractAddress = deployed.erc721Mock; // Replace with your deployed contract address

  // Connect to the deployed ERC721Mock contract
  const contract = ERC721Mock__factory.connect(contractAddress, signer);

  // Call setApprovalForAll to approve the Wyvern Exchange contract
  const tx = await contract.approve(addressToApprove, tokenId);
  console.log('Approval transaction hash:', tx.hash);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log('NFT transfer approved for Wyvern Exchange');
}

// approveNftTransfer().catch((error) => {
//   console.error('Error approving NFT transfer:', error);
//   process.exit(1);
// });

export default approveNftTransfer;