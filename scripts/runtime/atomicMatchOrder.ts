import { ethers } from "hardhat";
import mintNFT from "./mintNft";
import { readData } from "../util/file";
import { ERC721Mock__factory, StandardToken__factory, WyvernExchangeWithBulkCancellations__factory } from "../../typechain";
import { FeeMethod, HowToCall, SaleKind, Side } from "../util/enum";

interface Order {
  exchange: string;
  maker: string;
  taker: string;
  makerRelayerFee: number;
  takerRelayerFee: number;
  makerProtocolFee: number;
  takerProtocolFee: number;
  feeRecipient: string;
  feeMethod: FeeMethod;
  side: Side;
  saleKind: SaleKind;
  target: string;
  howToCall: HowToCall;
  calldata: string;
  replacementPattern: string;
  staticTarget: string;
  staticExtradata: string;
  paymentToken: string;
  basePrice: string;
  extra: string;
  listingTime: number;
  expirationTime: number;
  salt: number;
}

async function createOrders() {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const mintedNft = await mintNFT()

  const deployed = readData()

  // const paymentToken = StandardToken__factory.connect(deployed.standardToken)

  const erc721Token = ERC721Mock__factory.connect(deployed.ERC721Mock)

  const wyvernExchange = WyvernExchangeWithBulkCancellations__factory.connect(deployed.wyvernExchangeWithBulkCancellations)

  const sellerOrder: Order = {
    exchange: deployed.wyvernExchangeWithBulkCancellations,
    maker: seller.address,
    taker: ethers.ZeroAddress,
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeRecipient: deployer.address,
    feeMethod: FeeMethod.ProtocolFee,
    side: Side.Sell,
    saleKind: SaleKind.FixedPrice,
    target: await erc721Token.getAddress(),
    howToCall: HowToCall.Call,
    calldata: erc721Token.interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [seller.address, ethers.ZeroAddress, ethers.toBigInt(mintedNft.tokenId)]),
    replacementPattern: '0x',
    staticTarget: ethers.ZeroAddress,
    staticExtradata: '0x',
    paymentToken: ethers.ZeroAddress,
    basePrice: ethers.parseEther('1').toString(), // 1 ETH
    extra: '0',
    listingTime: Math.floor(Date.now() / 1000),
    expirationTime: Math.floor(Date.now() / 1000) + 3600 * 10, // 10 hours from now
    salt: Math.floor(Math.random() * 1000000),
  }

  console.log(sellerOrder);

  console.log(await wyvernExchange.DOMAIN_SEPARATOR.send())
  return
  const sellOrderHash = await wyvernExchange.hashToSign_(
    [
      sellerOrder.exchange,
      sellerOrder.maker,
      sellerOrder.taker,
      sellerOrder.feeRecipient,
      sellerOrder.target,
      sellerOrder.staticTarget,
      sellerOrder.paymentToken
    ],
    [
      sellerOrder.makerRelayerFee,
      sellerOrder.takerRelayerFee,
      sellerOrder.makerProtocolFee,
      sellerOrder.takerProtocolFee,
      sellerOrder.basePrice,
      sellerOrder.extra,
      sellerOrder.listingTime,
      sellerOrder.expirationTime,
      sellerOrder.salt,
    ],
    sellerOrder.feeMethod,
    sellerOrder.side,
    sellerOrder.saleKind,
    sellerOrder.howToCall,
    sellerOrder.calldata,
    sellerOrder.replacementPattern,
    sellerOrder.staticExtradata
  )

  console.log(sellOrderHash)
}

createOrders()