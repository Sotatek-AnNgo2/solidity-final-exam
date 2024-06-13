import { readData } from '../util/file';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { FeeMethod, HowToCall, SaleKind, Side } from '../util/enum';

export interface Order {
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

const deployed = readData()

const domain = {
  name: 'Wyvern Exchange Contract',
  version: '2.3',
  chainId: 1,
  verifyingContract: deployed.wyvernExchangeWithBulkCancellations
}

async function signOrder(signer: HardhatEthersSigner, orderData: Order) {
  return signer.signTypedData(domain, types, orderData)
}

export default signOrder;