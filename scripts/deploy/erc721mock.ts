import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const erc721Mock = await deploy("ERC721Mock", {
    from: deployer,
    log: true,
  });

  saveData({
    erc721Mock: erc721Mock.address,
  })
};
export default func;
func.id = "erc721Mock"; // id required to prevent reexecution
func.tags = ["erc721Mock"];