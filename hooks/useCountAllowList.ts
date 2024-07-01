import axios, { AxiosRequestConfig } from 'axios'

export const useCountAllowList = (collectionId?: string) => {
  const url = `${process.env.NEXT_PUBLIC_GRAPH_API_URL}`
  const operationsDoc = `query EvmCountAllowList($collectionId: String = "") {
    evmcollection_mints(where: {collection_id: {_eq: $collectionId}}) {
      allowlist_id
      collection_id
      created_at
      currency
      details
      end_time
      id
      kind
      max_mints_per_transaction
      max_mints_per_wallet
      max_supply
      price
      price_per_quantity
      start_time
      token_id
      status
      updated_at
      stage
      allow_list_item {
        allowlists_items {
          address
          allowlist_id
          max_mints
          price
        }
      }
    }
  }
  `

  const data = {
    query: operationsDoc,
    variables: {
      collectionId: collectionId,
    },
    operationName: 'EvmCountAllowList',
  }

  const request: AxiosRequestConfig = {
    url: url,
    method: 'post',
    data,
  }

  const res = axios.request(request)
  return res
}
