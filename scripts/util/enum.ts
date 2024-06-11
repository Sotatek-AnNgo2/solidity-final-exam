enum FeeMethod {
  ProtocolFee = 0,
  SplitFee = 1
}

enum SaleKind {
  FixedPrice = 0,
  DutchAuction = 1
}

enum Side {
  Buy = 0,
  Sell = 1
}

enum HowToCall {
  Call = 0,
  DelegateCall = 1
}

export { FeeMethod, SaleKind, Side, HowToCall }