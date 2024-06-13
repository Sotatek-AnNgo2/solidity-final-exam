import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { WyvernProxyRegistry__factory } from '../../typechain';

async function grantInitialAuthentication(authAddress: string) {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const deployed = readData();
  const contractAddress = deployed.wyvernProxyRegistry; // Replace with your deployed contract address

  const contract = WyvernProxyRegistry__factory.connect(contractAddress, deployer);

  const tx = await contract.grantInitialAuthentication(authAddress);
  await tx.wait();
}

export default grantInitialAuthentication;

// grantInitialAuthentication().then(console.log).catch(console.error);
