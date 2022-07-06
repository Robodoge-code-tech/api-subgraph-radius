import {
  RadiusStakingNft,
  Transfer,
} from "../generated/RadiusStakingNft/RadiusStakingNft";
import { StakingNft, StakingTransferLog } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const nftContract = RadiusStakingNft.bind(event.address);

  const id = event.params.tokenId.toHex();
  let nft = StakingNft.load(id);

  const transferId = `${event.transaction.hash.toHex()}-${
    event.params.tokenId
  }`;
  const log = new StakingTransferLog(transferId);

  if (!nft) {
    nft = new StakingNft(id);

    nft.contract = event.address;
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
