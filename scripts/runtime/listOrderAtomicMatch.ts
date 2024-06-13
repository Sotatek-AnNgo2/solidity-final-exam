import { ethers } from "hardhat";
import mintNFT from "./mintNft";
import { readData } from "../util/file";
import { ERC721Mock__factory, WyvernExchangeWithBulkCancellations__factory } from "../../typechain";
import { FeeMethod, HowToCall, SaleKind, Side } from "../util/enum";
import approveNftTransfer from "./approveNFTTransfer";
import registerProxy from "./registerProxy";
import grantInitialAuthentication from "./grantInitialAuthentication";
import signOrder, { Order } from "./signOrder";

const deployed = readData()

async function listOrderAtomicMatch() {
  const [deployer, seller, buyer] = await ethers.getSigners();
  // mint new nft for seller
  const mintedNft = await mintNFT()
  // create proxy, so wyvern exchange can transfer nft through this proxy
  const proxyAddress = await registerProxy(seller)
  // allow proxy to transfer minted nft
  await approveNftTransfer(seller, proxyAddress, mintedNft.tokenId)
  // allow wyvern exchange to proxies
  await grantInitialAuthentication(deployed.wyvernExchangeWithBulkCancellations).catch(() => console.log('already grantInitialAuthentication'))
  const sellerNonce = deployed.sellerNonce ?? 0
  const buyerNonce = deployed.buyerNonce ?? 0

  // const paymentToken = StandardToken__factory.connect(deployed.standardToken)
  const erc721Token = ERC721Mock__factory.connect(deployed.erc721Mock, seller)
  console.log('nft owner before', await erc721Token.ownerOf(mintedNft.tokenId))

  // ================================ Create Seller Order ================================
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
    // calldata to call when match order
    calldata: erc721Token.interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [seller.address, ethers.ZeroAddress, ethers.toBigInt(mintedNft.tokenId)]),
    // 4 byte đầu là function selector, những 32 bytes tiếp theo là bitmark(address from, address to, uint256 tokenId), from và tokenId là tham số đã biết, to là tham số chưa biết nên replacementPattern tại vị trí tham số này là 'ff..f'
    replacementPattern: '0x' + '0'.repeat(8) + '0'.repeat(64) + 'f'.repeat(64) + '0'.repeat(64),
    staticTarget: ethers.ZeroAddress,
    staticExtradata: '0x',
    // zeroaddress for use native coin
    paymentToken: ethers.ZeroAddress,
    basePrice: ethers.parseEther('1').toString(), // 1 ETH
    extra: '0',
    listingTime: Math.floor(Date.now() / 1000),
    expirationTime: Math.floor(Date.now() / 1000) + 3600 * 10, // 10 hours from now
    salt: Math.floor(Math.random() * 1000000),
    nonce: sellerNonce,
  }

  // sign eip712
  const sellerSignature = await signOrder(seller, sellerOrder)

  const sellerSplitSignature = ethers.Signature.from(sellerSignature)

  Object.assign(sellerOrder, { r: sellerSplitSignature.r, s: sellerSplitSignature.s, v: sellerSplitSignature.v })

  // ================================ Create Buyer Order ================================
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
    calldata: erc721Token.interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [seller.address, buyer.address, ethers.toBigInt(mintedNft.tokenId)]),
    replacementPattern: '0x' + '0'.repeat(8) + '0'.repeat(64) + '0'.repeat(64) + '0'.repeat(64),
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

  const buyerSignature = await signOrder(buyer, buyerOrder)

  const buyerSplitSignature = ethers.Signature.from(buyerSignature)

  Object.assign(buyerOrder, { r: buyerSplitSignature.r, s: buyerSplitSignature.s, v: buyerSplitSignature.v })

  // ================================ Call Atomic Match ================================
  const wyvernExchangeWithBuyerSigner = WyvernExchangeWithBulkCancellations__factory.connect(deployed.wyvernExchangeWithBulkCancellations, buyer)
  const tx = await wyvernExchangeWithBuyerSigner.atomicMatch_(
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

  await tx.wait()

  console.log('nft owner after', await erc721Token.ownerOf(mintedNft.tokenId))
  // console.log(result)
}

listOrderAtomicMatch()