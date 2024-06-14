import { ethers, upgrades, deployments } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { it } from "mocha";
import { expect } from "chai";
import { FeeMethod, SaleKind, Side } from "../scripts/util/enum";

describe("WyvernExchange contract", function () {
  async function deployWyvernExchangeFixture() {
    const WyvernExchange = await ethers.getContractFactory("WyvernExchangeWithBulkCancellations");
    const [deployer, seller, buyer] = await ethers.getSigners();

    const { registry } = await deployWyvernProxyRegistryFixture()
    const { tokenTransferProxy } = await deployWyvernTokenTransferProxyFixture(await registry.getAddress())
    const { token } = await deployWyvernTokenFixture()
    const { protocolFee } = await deployProtocolFeeFixture()

    console.log(await registry.getAddress())
    console.log(await tokenTransferProxy.getAddress())
    console.log(await token.getAddress())
    console.log(await protocolFee.getAddress())

    const exchange = await WyvernExchange.deploy(registry, tokenTransferProxy, token, protocolFee)
    await exchange.waitForDeployment();

    return {
      exchange, registry, tokenTransferProxy, token, protocolFee, deployer,
    }
  }

  async function deployWyvernProxyRegistryFixture() {
    const WyvernProxyRegistry = await ethers.getContractFactory("WyvernProxyRegistry");
    const wyvernRegistry = await WyvernProxyRegistry.deploy()
    await wyvernRegistry.waitForDeployment();
    return { registry: wyvernRegistry }
  }

  async function deployWyvernTokenTransferProxyFixture(registryAddress: string) {
    const WyvernTokenTransferProxy = await ethers.getContractFactory("WyvernTokenTransferProxy");
    const wyvernTokenTransferProxy = await WyvernTokenTransferProxy.deploy(registryAddress)
    wyvernTokenTransferProxy.waitForDeployment()
    return { tokenTransferProxy: wyvernTokenTransferProxy }
  }

  async function deployWyvernTokenFixture() {
    const WyvernToken = await ethers.getContractFactory("WyvernToken")
    const wyvernToken = await WyvernToken.deploy(185976814178002)
    await wyvernToken.waitForDeployment()
    return { token: wyvernToken }
  }

  async function deployProtocolFeeFixture() {
    const WyvernDAOProxy = await ethers.getContractFactory("WyvernDAOProxy")
    const wyvernDAOProxy = await WyvernDAOProxy.deploy()
    wyvernDAOProxy.waitForDeployment()
    return { protocolFee: wyvernDAOProxy }
  }

  async function makeOrder(exchange: string) {
    const [deployer, seller, buyer] = await ethers.getSigners();

    return {
      exchange: exchange,
      maker: seller,
      taker: buyer,
      makerRelayerFee: 0,
      takerRelayerFee: 0,
      makerProtocolFee: 0,
      takerProtocolFee: 0,
      feeRecipient: ethers.ZeroAddress,
      feeMethod: FeeMethod.ProtocolFee,
      side: Side.Buy,
      saleKind: 0,
      target: proxy,
      howToCall: 0,
      calldata: '0x',
      replacementPattern: '0x',
      staticTarget: ethers.ZeroAddress,
      staticExtradata: '0x',
      paymentToken: accounts[0],
      basePrice: new BigNumber(0),
      extra: 0,
      listingTime: 0,
      expirationTime: 0,
      salt: new BigNumber(0)
    }
  }

  describe('Deployment', () => {
    it('Should deploy success', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      expect(await exchange.getAddress()).not.equal(ethers.ZeroAddress)
    })
  })

  describe('Runtime', async () => {
    it('Should replace pattern', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const result = await exchange.guardedArrayReplace('0xff', '0x00', '0xff')
      expect(result).equal('0x00')
    })

    it('Should not replace pattern', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const result = await exchange.guardedArrayReplace('0xff', '0x00', '0x00')
      expect(result).equal('0xff')
    })

    it('Should return base price', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const now = Math.floor(Date.now() / 1000)
      const result = await exchange.calculateFinalPrice(Side.Buy, SaleKind.FixedPrice, 10, 0, now, now + 3600)
      expect(result).equal(10)
    })

    it('Should again return base price', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const now = Math.floor(Date.now() / 1000)
      const result = await exchange.calculateFinalPrice(Side.Buy, SaleKind.DutchAuction, 1000, 0, now, now + 3600)
      expect(result).equal(1000)
    })

    it('Should calculate the right dutch price', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const now = Math.floor(Date.now() / 1000)
      const result = await exchange.calculateFinalPrice(Side.Sell, SaleKind.DutchAuction, 1000, 500, now - 3600, now + 3600)
      expect(result).lessThanOrEqual(751).greaterThanOrEqual(750)
    })

    it('Should calculate the right dutch price', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const now = Math.floor(Date.now() / 1000)
      const result = await exchange.calculateFinalPrice(Side.Buy, SaleKind.DutchAuction, 1000, 500, now - 3600, now + 3600)
      expect(result).lessThanOrEqual(1250).greaterThanOrEqual(1249)
    })

    it('Should match calldata', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const result = await exchange.orderCalldataCanMatch('0x00', '0xff', '0xff', '0x00')
      expect(result).equal(true)
    })

    it('Should match calldata', async () => {
      const { exchange } = await loadFixture(deployWyvernExchangeFixture);
      const result = await exchange.orderCalldataCanMatch('0x00', '0xff', '0xff', '0xff')
      expect(result).equal(true)
    })

    // it('Should match calldata', async () => {
    //   const { exchange } = await loadFixture(deployWyvernExchangeFixture);
    //   const result = await exchange.calculateMatchPrice_('0x00', '0xff', '0xff', '0xff')
    //   expect(result).equal(true)
    // })

  })
});
