import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, ...rest } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const ERC721Mock = await deploy("ERC721Mock", {
    from: deployer,
    log: true,
  });

  saveData({
    ERC721Mock: ERC721Mock.address,
    deployer,
  })
};
export default func;
func.id = "ERC721Mock"; // id required to prevent reexecution
func.tags = ["ERC721Mock"];