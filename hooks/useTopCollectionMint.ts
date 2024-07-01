import axios, { AxiosRequestConfig } from 'axios'

export const useTopCollectionMint = (limit: Number, filterPrice?: string) => {
  const url = `${process.env.NEXT_PUBLIC_GRAPH_API_URL}`
  let priceCriteria = `{}`

  if (filterPrice === 'free') {
    priceCriteria = `{"price": {"_eq": 0}}`
  }

  if (filterPrice === 'paid') {
    priceCriteria = `{"price": {"_gt": 0}}`
  }

  const operationsDoc = `query EvmGetTopCollectionMintList($limit: Int = 50, $priceCriteria: collection_mints_bool_exp = {}) {
    evmcollection_mints(order_by: {created_at: desc}, limit: $limit, where: $priceCriteria) {
      collection_id
      created_at
      currency
      collection {
        metadata
        all_time_volume
        day30_volume
        day30_volume_change
        day1_volume_change
        day7_volume
        day7_volume_change
        day1_volume
        floor_sell_id
        floor_sell_value
        token_count
        owner_count
        on_sale_count
        name
        nfts(limit: 4, order_by: {rarity_rank: asc}) {
          image
        }
        floor_sell_maker
        is_minting
        is_spam
        nfts_realtime_count
      }
      stage
      start_time
      price
      max_supply
      end_time
      kind
      mint_standard {
        standard
      }
    }
    evmcollection_mints_aggregate(order_by: {created_at: desc}, where: $priceCriteria) {
      aggregate {
        count
      }
    }
  }
  `

  const data = {
    query: operationsDoc,
    variables: {
      limit: limit,
      priceCriteria: JSON.parse(priceCriteria)
    },
    operationName: 'EvmGetTopCollectionMintList',
  }

  const request: AxiosRequestConfig = {
    url: url,
    method: 'post',
    data,
  }

  const res = axios.request(request)
  return res
}
