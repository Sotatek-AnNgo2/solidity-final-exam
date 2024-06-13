import { ethers } from 'hardhat';
import { readData } from '../util/file';
import { WyvernProxyRegistry__factory } from '../../typechain';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

async function registerProxy(signer: HardhatEthersSigner) {
  const deployed = readData();
  const contractAddress = deployed.wyvernProxyRegistry; // Replace with your deployed contract address

  const contract = WyvernProxyRegistry__factory.connect(contractAddress, signer);

  const existProxy = await contract.proxies(signer.address)

  if (existProxy !== ethers.ZeroAddress) return existProxy;

  const tx = await contract.registerProxy();
  await tx.wait();

  return contract.proxies(signer.address)
}

export default registerProxy;

// registerProxy().then(console.log).catch(console.error);
