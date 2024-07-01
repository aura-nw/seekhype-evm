import axios, { AxiosRequestConfig } from 'axios'

export const useFeaturedCollection = (limit: Number) => {
  const url = `${process.env.NEXT_PUBLIC_GRAPH_API_URL}`
  const operationsDoc = `query EvmGetFeaturedCollectionList($limit: Int = 5) {
    evmevm_collections(limit: $limit, order_by: {all_time_volume: desc}, where: {featured_at: {_is_null: false}}) {
      created_at
      all_time_volume
      all_time_rank
      contract
      day30_volume
      day30_volume_change
      floor_sell_id
      floor_sell_value
      metadata
      name
      token_count
      id
      is_spam
      on_sale_count
      day1_volume_change
      day7_volume
      day7_volume_change
      day1_volume
      owner_count
      floor_sell_maker
      nfts(limit: 4, order_by: {rarity_rank: asc}) {
        image
      }
    }
  }
  `

  const data = {
    query: operationsDoc,
    variables: {
      limit: limit,
    },
    operationName: 'EvmGetFeaturedCollectionList',
  }

  const request: AxiosRequestConfig = {
    url: url,
    method: 'post',
    data,
  }

  const res = axios.request(request)
  return res
}
