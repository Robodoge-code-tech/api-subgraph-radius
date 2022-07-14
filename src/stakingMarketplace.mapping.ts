import { BigInt } from "@graphprotocol/graph-ts";
import {
  AuctionCancel,
  AuctionStart,
  AuctionEnd,
  NFTPutOnSale,
  NFTRemovedFromSale,
  NFTSalePriceUpdated,
  NFTSold,
  PlaceBid,
  RadiusStakingMarketplace,
} from "../generated/RadiusStakingMarketplace/RadiusStakingMarketplace";
import {
  StakingAuction,
  StakingSale,
  StakingBid,
  StakingNft,
  StakingTransferLog,
} from "../generated/schema";

export function handleNFTPutOnSale(event: NFTPutOnSale): void {
  const nftId = event.params.tokenId.toHex();
  let nft = StakingNft.load(nftId);

  if (!nft) return;

  nft.owner = event.transaction.from;

  nft.save();

  const id = event.params.saleId.toHex();
  const sale = new StakingSale(id);

  sale.status = "ACTIVE";
  sale.nft = event.params.tokenId.toHex();
  sale.originalOwner = event.transaction.from;
  sale.price = event.params.price;
  sale.currency = event.params.currency.toString() === "0" ? "RADIUS" : "AVAX";

  sale.save();
}

export function handleNFTSalePriceUpdated(event: NFTSalePriceUpdated): void {
  const id = event.params.saleId.toHex();
  const sale = StakingSale.load(id);

  if (!sale) return;

  sale.price = event.params.price;
  sale.currency = event.params.currency.toString() === "0" ? "RADIUS" : "AVAX";

  sale.save();
}

export function handleNFTSold(event: NFTSold): void {
  const id = event.params.saleId.toHex();
  let sale = StakingSale.load(id);

  if (!sale) return;

  sale.newOwner = event.transaction.from;
  sale.status = "COMPLETE";
  sale.save();

  let log = StakingTransferLog.load(
    `${event.transaction.hash.toHex()}-${event.params.tokenId}`
  );

  if (!log) return;

  log.type = "SALE";
  log.price = sale.price;
  log.currency = sale.currency;
  log.save();
}

export function handleNFTRemovedFromSale(event: NFTRemovedFromSale): void {
  const id = event.params.saleId.toHex();
  let sale = StakingSale.load(id);

  if (!sale) return;

  sale.status = "CANCELLED";

  sale.save();
}

export function handleAuctionStart(event: AuctionStart): void {
  const nftId = event.params.tokenId.toHex();
  let nft = StakingNft.load(nftId);

  if (!nft) return;

  nft.owner = event.transaction.from;

  nft.save();

  const id = event.params.auctionId.toHex();
  const auction = new StakingAuction(id);

  auction.status = "ACTIVE";
  auction.nft = event.params.tokenId.toHex();
  auction.originalOwner = event.transaction.from;
  auction.startingBid = event.params.startingBid;
  auction.nextAllowedBid = event.params.startingBid;
  auction.startingTime = event.params.startingTime.times(BigInt.fromI32(1000));
  auction.duration = event.params.duration.times(BigInt.fromI32(1000));
  auction.endTime = event.params.startingTime
    .plus(event.params.duration)
    .times(BigInt.fromI32(1000));
  auction.currency =
    event.params.currency.toString() === "0" ? "RADIUS" : "AVAX";

  auction.save();
}

export function handleAuctionCancel(event: AuctionCancel): void {
  const id = event.params.auctionId.toHex();
  let auction = StakingAuction.load(id);

  if (!auction) return;

  auction.status = "CANCELLED";

  auction.save();
}

export function handlePlaceBid(event: PlaceBid): void {
  const marketplaceContract = RadiusStakingMarketplace.bind(event.address);
  const minBidRise = marketplaceContract.MIN_BID_RISE();

  const id = event.params.auctionId.toHex();
  let auction = StakingAuction.load(id);

  if (!auction) return;

  const bidId = `${event.params.auctionId.toString()}-${event.params.bid.toString()}`;
  const bid = new StakingBid(bidId);

  bid.auction = id;
  bid.bidder = event.transaction.from;
  bid.amount = event.params.bid;

  bid.save();

  auction.nft = event.params.tokenId.toHex();
  auction.highestBidder = event.transaction.from;
  auction.highestBid = event.params.bid;
  auction.nextAllowedBid = event.params.bid.plus(
    event.params.bid.times(minBidRise).div(BigInt.fromI32(10000))
  );
  auction.duration = marketplaceContract.auctions(event.params.tokenId).value4;
  auction.endTime = auction.startingTime.plus(
    marketplaceContract
      .auctions(event.params.tokenId)
      .value4.times(BigInt.fromI32(1000))
  );

  auction.save();
}

export function handleAuctionEnd(event: AuctionEnd): void {
  const id = event.params.auctionId.toHex();
  let auction = StakingAuction.load(id);

  if (!auction) return;

  auction.status = "COMPLETE";
  auction.save();

  let log = StakingTransferLog.load(
    `${event.transaction.hash.toHex()}-${event.params.tokenId}`
  );

  if (!log) return;

  log.type = "AUCTION";
  log.price = event.params.highestBid;

  log.currency = auction.currency;
  log.save();
}
