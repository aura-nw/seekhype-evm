interface VolumeChange {
  '1day': number
  '7day': number
  '30day': number
}
interface CollectionVolume {
  '1day': number
  '7day': number
  '30day': number
  allTime: number
}
interface Currency {
  contract: string
}
interface Amount {
  raw: string | null
  decimal: number
  usd?: any
  native: number
}
interface Price {
  currency: Currency
  amount: Amount
}
interface FloorAsk {
  id: string
  sourceDomain: string
  price: Price
}
interface TopBid {
  id?: any
  sourceDomain?: any
  price?: any
  maker?: any
  validFrom?: any
  validUntil?: any
}
interface TopCollectionItem {
  volume: number
  volumePercentChange?: any
  count: number
  countPercentChange?: any
  id: string
  image: string | null
  sampleImages: string[]
  isSpam: boolean
  openseaVerificationStatus?: any
  magicedenVerificationStatus?: any
  name: string
  onSaleCount: number
  volumeChange: VolumeChange
  collectionVolume: CollectionVolume
  floorAskPercentChange?: any
  tokenCount: number
  ownerCount: number
  banner: string | null
  description: string | null
  floorAsk: FloorAsk
  topBid?: TopBid
}

interface Metadata {
  name: string
  imageUrl: string
  discordUrl: string
  twitterUrl: string
  description: string
  externalUrl: string
  telegramUrl: string
  bannerImageUrl: string
  twitterUsername: string
}
interface Nfts {
  image: string
}
interface TopCollectionRawItem {
  created_at: string
  all_time_volume: number
  all_time_rank: number
  contract: string
  day30_volume: number
  day30_volume_change?: any
  floor_sell_id: string
  floor_sell_value: number
  metadata: Metadata
  name: string
  token_count: number
  id: string
  is_spam: number
  is_minting: boolean
  on_sale_count: number
  day1_volume_change: number
  day7_volume: number
  day7_volume_change: number
  day1_volume: number
  owner_count: number
  floor_sell_maker: string
  nfts: Nfts[]
  nfts_realtime_count: number
}

interface Mintstandard {
  standard: string
}

interface TopCollectionMintRawItem {
  collection_id: string
  created_at: string
  currency: string
  collection: TopCollectionRawItem
  stage: string
  kind: string
  start_time: string
  price?: any
  max_supply: number
  end_time: string
  mint_standard: Mintstandard
}

interface MintStage {
  stage: string
  kind: string
  tokenId?: any
  price: Price
  startTime?: any
  endTime?: any
  maxMintsPerWallet?: any
}

interface TopCollectionMintItem {
  id: string
  image: string | null
  banner?: string | null
  name: string
  description: string | null
  isSpam: boolean
  isMinting: boolean
  onSaleCount: number
  volumeChange: VolumeChange
  collectionVolume: CollectionVolume
  tokenCount: number
  ownerCount: number
  sampleImages: string[]
  mintType: string
  mintPrice: string
  maxSupply: number
  mintStandard: string
  createdAt: string
  startDate?: any
  endDate?: any
  mintCount: number
  sixHourCount: number
  oneHourCount: number
  mintVolume: number
  openseaVerificationStatus?: any
  magicedenVerificationStatus?: any
  mintStages: MintStage[]
  floorAsk: FloorAsk
}
