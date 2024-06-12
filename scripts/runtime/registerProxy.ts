import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { ERC721Mock__factory, WyvernProxyRegistry__factory } from '../../typechain';

async function registerProxy(address?: string) {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const deployed = readData();
  const contractAddress = deployed.wyvernProxyRegistry; // Replace with your deployed contract address

  const contract = WyvernProxyRegistry__factory.connect(contractAddress, seller);

  const existProxy = await contract.proxies(address ?? seller.address)

  if (existProxy !== ethers.ZeroAddress) return existProxy;

  const tx = await contract.registerProxy();
  await tx.wait();

  return contract.proxies(seller.address)
}

export default registerProxy;

// registerProxy().then(console.log).catch(console.error);
