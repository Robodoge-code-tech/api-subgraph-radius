import {
  RemoveNft,
  AddNft,
} from "../generated/RadiusItemRemover/RadiusItemRemover";
import { Nft, Auction, Sale } from "../generated/schema";

export function handleRemoveNft(event: RemoveNft): void {
  const id = event.params.id.toHex();
  const nft = Nft.load(id);

  if (!nft) return;
  nft.hidden = true;

  nft.save();

  // if (!nft.auctions) return;
  // if (!nft.auctions.length) return;
  // const auctionId = nft.auctions[nft.auctions.length - 1];
  // if (!auctionId) return;
  // const auction = Auction.load(auctionId);

  // if (!auction) return;
  // auction.hidden = true;

  // auction.save();

  // if (nft.sales) {
  //   const saleId = nft.sales[nft.sales.length - 1];
  //   if (!saleId) return;
  //   const sale = Sale.load(saleId);

  //   if (!sale) return;
  //   sale.hidden = true;

  //   sale.save();
  // }
}

export function handleAddNft(event: AddNft): void {
  const id = event.params.id.toHex();
  const nft = Nft.load(id);

  if (!nft) return;
  nft.hidden = false;

  nft.save();

  // if (!nft.auctions) return;
  // if (!nft.auctions.length) return;
  // const auctionId = nft.auctions[nft.auctions.length - 1];
  // if (!auctionId) return;
  // const auction = Auction.load(auctionId);

  // if (!auction) return;
  // auction.hidden = false;

  // auction.save();

  // if (nft.sales) {
  //   const saleId = nft.sales[nft.sales.length - 1];
  //   if (!saleId) return;
  //   const sale = Sale.load(saleId);

  //   if (!sale) return;
  //   sale.hidden = false;

  //   sale.save();
  // }
}
