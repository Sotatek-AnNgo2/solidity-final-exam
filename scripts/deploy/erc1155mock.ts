import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "dotenv";
import { saveData } from "../util/file";
config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const erc1155Mock = await deploy("ERC1155Mock", {
    from: deployer,
    log: true,
    args: ['random uri']
  });

  saveData({
    erc1155Mock: erc1155Mock.address,
  })
};
export default func;
func.id = "erc1155Mock"; // id required to prevent reexecution
func.tags = ["erc1155Mock"];