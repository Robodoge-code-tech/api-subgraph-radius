import { RadiusNft, Transfer } from "../generated/RadiusNft/RadiusNft";
import { Nft, TransferLog } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const nftContract = RadiusNft.bind(event.address);

  const id = event.params.tokenId.toHex();
  let nft = Nft.load(id);

  const transferId = `${event.transaction.hash.toHex()}-${
    event.params.tokenId
  }`;
  const log = new TransferLog(transferId);

  if (!nft) {
    nft = new Nft(id);

    nft.contract = event.address;
    nft.hidden = false;
    nft.tokenId = event.params.tokenId;
    nft.metadata = nftContract.tokenURI(event.params.tokenId);

    log.type = "MINT";
  } else {
    log.type = "TRANSFER";
  }

  nft.owner = event.params.to;

  nft.save();

  log.nft = id;
  log.from = event.params.from;
  log.to = event.params.to;
  log.timestamp = event.block.timestamp;

  log.save();
}
