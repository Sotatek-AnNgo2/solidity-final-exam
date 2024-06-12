import { ethers } from "hardhat";
import mintNFT from "./mintNft";
import { readData } from "../util/file";
import { ERC721Mock__factory, StandardToken__factory, WyvernExchangeWithBulkCancellations__factory } from "../../typechain";
import { FeeMethod, HowToCall, SaleKind, Side } from "../util/enum";
import approveNftTransfer from "./approveNFTTransfer";

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
  nonce: number;
  r?: string;
  s?: string;
  v?: 27 | 28;
}

const deployed = readData()

const domain = {
  name: 'Wyvern Exchange Contract',
  version: '2.3',
  chainId: 1,
  verifyingContract: deployed.wyvernExchangeWithBulkCancellations
}

const types = {
  Order: [
    { name: 'exchange', type: 'address' },
    { name: 'maker', type: 'address' },
    { name: 'taker', type: 'address' },
    { name: 'makerRelayerFee', type: 'uint256' },
    { name: 'takerRelayerFee', type: 'uint256' },
    { name: 'makerProtocolFee', type: 'uint256' },
    { name: 'takerProtocolFee', type: 'uint256' },
    { name: 'feeRecipient', type: 'address' },
    { name: 'feeMethod', type: 'uint8' },
    { name: 'side', type: 'uint8' },
    { name: 'saleKind', type: 'uint8' },
    { name: 'target', type: 'address' },
    { name: 'howToCall', type: 'uint8' },
    { name: 'calldata', type: 'bytes' },
    { name: 'replacementPattern', type: 'bytes' },
    { name: 'staticTarget', type: 'address' },
    { name: 'staticExtradata', type: 'bytes' },
    { name: 'paymentToken', type: 'address' },
    { name: 'basePrice', type: 'uint256' },
    { name: 'extra', type: 'uint256' },
    { name: 'listingTime', type: 'uint256' },
    { name: 'expirationTime', type: 'uint256' },
    { name: 'salt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
};

async function createOrders() {
  const [deployer, seller, buyer] = await ethers.getSigners();
  const mintedNft = await mintNFT()
  await approveNftTransfer()

  const sellerNonce = deployed.sellerNonce ?? 0
  const buyerNonce = deployed.buyerNonce ?? 0

  // const paymentToken = StandardToken__factory.connect(deployed.standardToken)

  const erc721Token = ERC721Mock__factory.connect(deployed.ERC721Mock)
  // ================================ Create Seller Order ================================
  const wyvernExchangeWithSellerSigner = WyvernExchangeWithBulkCancellations__factory.connect(deployed.wyvernExchangeWithBulkCancellations, seller)

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
    replacementPattern: '0x' + '0'.repeat(8) + '0'.repeat(64) + 'f'.repeat(64) + '0'.repeat(64),
    staticTarget: ethers.ZeroAddress,
    staticExtradata: '0x',
    paymentToken: ethers.ZeroAddress,
    basePrice: ethers.parseEther('1').toString(), // 1 ETH
    extra: '0',
    listingTime: Math.floor(Date.now() / 1000),
    expirationTime: Math.floor(Date.now() / 1000) + 3600 * 10, // 10 hours from now
    salt: Math.floor(Math.random() * 1000000),
    nonce: sellerNonce,
  }

  const sellOrderHash = await wyvernExchangeWithSellerSigner.hashToSign_(
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

  const sellerSignature = await seller.signTypedData(domain, types, sellerOrder)

  // const sellerSignature = await seller.signMessage(ethers.getBytes(sellOrderHash))

  const sellerSplitSignature = ethers.Signature.from(sellerSignature)

  Object.assign(sellerOrder, { r: sellerSplitSignature.r, s: sellerSplitSignature.s, v: sellerSplitSignature.v })
  const recoveredAddress = ethers.verifyMessage(sellOrderHash, sellerSplitSignature)
  console.log({ recoveredAddress })
  console.log({ sellOrderHash })
  console.log("sellerOrder", sellerOrder);

  // ================================ Create Buyer Order ================================
  const wyvernExchangeWithBuyerSigner = WyvernExchangeWithBulkCancellations__factory.connect(deployed.wyvernExchangeWithBulkCancellations, buyer)

  const buyerOrder: Order = {
    exchange: deployed.wyvernExchangeWithBulkCancellations,
    maker: buyer.address,
    taker: ethers.ZeroAddress,
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeRecipient: ethers.ZeroAddress,
    feeMethod: FeeMethod.ProtocolFee,
    side: Side.Buy,
    saleKind: SaleKind.FixedPrice,
    target: await erc721Token.getAddress(),
    howToCall: HowToCall.Call,
    calldata: erc721Token.interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [ethers.ZeroAddress, buyer.address, ethers.toBigInt(mintedNft.tokenId)]),
    replacementPattern: '0x' + '0'.repeat(8) + 'f'.repeat(64) + '0'.repeat(64) + '0'.repeat(64),
    staticTarget: ethers.ZeroAddress,
    staticExtradata: '0x',
    paymentToken: sellerOrder.paymentToken,
    basePrice: sellerOrder.basePrice, // 1 ETH
    extra: sellerOrder.extra,
    listingTime: sellerOrder.listingTime,
    expirationTime: sellerOrder.expirationTime, // 10 hours from now
    salt: Math.floor(Math.random() * 1000000),
    nonce: buyerNonce,
  }

  const buyOrderHash = await wyvernExchangeWithBuyerSigner.hashToSign_(
    [
      buyerOrder.exchange,
      buyerOrder.maker,
      buyerOrder.taker,
      buyerOrder.feeRecipient,
      buyerOrder.target,
      buyerOrder.staticTarget,
      buyerOrder.paymentToken
    ],
    [
      buyerOrder.makerRelayerFee,
      buyerOrder.takerRelayerFee,
      buyerOrder.makerProtocolFee,
      buyerOrder.takerProtocolFee,
      buyerOrder.basePrice,
      buyerOrder.extra,
      buyerOrder.listingTime,
      buyerOrder.expirationTime,
      buyerOrder.salt,
    ],
    buyerOrder.feeMethod,
    buyerOrder.side,
    buyerOrder.saleKind,
    buyerOrder.howToCall,
    buyerOrder.calldata,
    buyerOrder.replacementPattern,
    buyerOrder.staticExtradata
  )

  const buyerSignature = await seller.signTypedData(domain, types, buyerOrder)

  const buyerSplitSignature = ethers.Signature.from(buyerSignature)

  Object.assign(buyerOrder, { r: buyerSplitSignature.r, s: buyerSplitSignature.s, v: buyerSplitSignature.v })
  console.log({ buyOrderHash })
  console.log(buyerOrder)

  // ================================ Call Atomic Match ================================
  const result = await wyvernExchangeWithBuyerSigner.atomicMatch_(
    [
      buyerOrder.exchange,
      buyerOrder.maker,
      buyerOrder.taker,
      buyerOrder.feeRecipient,
      buyerOrder.target,
      buyerOrder.staticTarget,
      buyerOrder.paymentToken,
      sellerOrder.exchange,
      sellerOrder.maker,
      sellerOrder.taker,
      sellerOrder.feeRecipient,
      sellerOrder.target,
      sellerOrder.staticTarget,
      sellerOrder.paymentToken,
    ],
    [
      buyerOrder.makerRelayerFee,
      buyerOrder.takerRelayerFee,
      buyerOrder.makerProtocolFee,
      buyerOrder.takerProtocolFee,
      buyerOrder.basePrice,
      buyerOrder.extra,
      buyerOrder.listingTime,
      buyerOrder.expirationTime,
      buyerOrder.salt,
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
    [
      buyerOrder.feeMethod,
      buyerOrder.side,
      buyerOrder.saleKind,
      buyerOrder.howToCall,
      sellerOrder.feeMethod,
      sellerOrder.side,
      sellerOrder.saleKind,
      sellerOrder.howToCall,
    ],
    buyerOrder.calldata,
    sellerOrder.calldata,
    buyerOrder.replacementPattern,
    sellerOrder.replacementPattern,
    buyerOrder.staticExtradata,
    sellerOrder.staticExtradata,
    [
      buyerOrder.v!,
      sellerOrder.v!,
    ],
    [
      buyerOrder.r!,
      buyerOrder.s!,
      sellerOrder.r!,
      sellerOrder.s!,
      sellerOrder.s!,
    ],
    { value: buyerOrder.basePrice }
  )

  console.log(result)
}

createOrders()