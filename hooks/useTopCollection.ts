import axios, { AxiosRequestConfig } from 'axios'

export const useTopCollection = (limit: Number) => {
  const url = `${process.env.NEXT_PUBLIC_GRAPH_API_URL}`
  const operationsDoc = `query EvmGetTopCollectionList($limit: Int = 50) {
    evmevm_collections(limit: $limit, order_by: {all_time_volume: desc}, where: {all_time_volume: {_gt: 1000000000000000000}}) {
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
    evmevm_collections_aggregate(order_by: {all_time_volume: desc}, where: {all_time_volume: {_gt: 1000000000000000000}}) {
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
    },
    operationName: 'EvmGetTopCollectionList',
  }

  const request: AxiosRequestConfig = {
    url: url,
    method: 'post',
    data,
  }

  const res = axios.request(request)
  return res
}
