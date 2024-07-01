import { useTrendingCollections } from '@sh-reservoir0x/reservoir-kit-ui'
import { paths } from '@sh-reservoir0x/reservoir-sdk'
import { Head } from 'components/Head'
import Layout from 'components/Layout'
import ChainToggle from 'components/common/ChainToggle'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import LoadingSpinner from 'components/common/LoadingSpinner'
import { Box, Flex, Text } from 'components/primitives'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { ChainContext } from 'context/ChainContextProvider'
import { useMounted } from 'hooks'
import { useTopCollection } from 'hooks/useTopCollection'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useMediaQuery } from 'react-responsive'
import supportedChains, { DefaultChain } from 'utils/chains'
import fetcher from 'utils/fetcher'
import { formatUnits, zeroAddress } from 'viem'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const isSSR = typeof window === 'undefined'
  const isValidating = false
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const [sortByTime, setSortByTime] = useState<CollectionsSortingOption>('30d')

  let collectionQuery: Parameters<typeof useTrendingCollections>['0'] = {
    limit: 1000,
    period: sortByTime,
  }

  const { chain, switchCurrentChain } = useContext(ChainContext)

  useEffect(() => {
    if (router.query.chain) {
      let chainIndex: number | undefined
      for (let i = 0; i < supportedChains.length; i++) {
        if (supportedChains[i].routePrefix == router.query.chain) {
          chainIndex = supportedChains[i].id
        }
      }
      if (chainIndex !== -1 && chainIndex) {
        switchCurrentChain(chainIndex)
      }
    }
  }, [router.query])

  // const remapData = (collectionList: TopCollectionRawItem[]) => {
  //   let result: TopCollectionItem[] = []
  //   if (collectionList?.length > 0) {
  //     collectionList?.forEach((collection) => {
  //       const mappedItem: TopCollectionItem = {
  //         banner: collection?.metadata?.bannerImageUrl || null,
  //         collectionVolume: {
  //           '1day': collection?.day1_volume
  //             ? Number(formatUnits(BigInt(collection?.day1_volume), 18))
  //             : 0,
  //           '7day': collection?.day7_volume
  //             ? Number(formatUnits(BigInt(collection?.day7_volume), 18))
  //             : 0,
  //           '30day': collection?.day30_volume
  //             ? Number(formatUnits(BigInt(collection?.day30_volume), 18))
  //             : 0,
  //           allTime: collection?.all_time_volume
  //             ? Number(formatUnits(BigInt(collection?.all_time_volume), 18))
  //             : 0,
  //         },
  //         count: collection?.token_count,
  //         countPercentChange: null,
  //         description: collection?.metadata?.description || null,
  //         floorAsk: {
  //           id: collection?.floor_sell_id,
  //           price: {
  //             amount: {
  //               decimal: collection?.floor_sell_value
  //                 ? Number(
  //                     formatUnits(BigInt(collection?.floor_sell_value), 18)
  //                   )
  //                 : 0,
  //               native: collection?.floor_sell_value
  //                 ? Number(
  //                     formatUnits(BigInt(collection?.floor_sell_value), 18)
  //                   )
  //                 : 0,
  //               raw: collection?.floor_sell_value?.toString() || null,
  //               usd: null,
  //             },
  //             currency: {
  //               contract: zeroAddress,
  //             },
  //           },
  //           sourceDomain: '',
  //         },
  //         floorAskPercentChange: null,
  //         volume: collection?.all_time_volume,
  //         id:
  //           collection?.contract?.indexOf('\\') > -1
  //             ? collection?.contract?.replace('\\', '0')
  //             : collection?.contract,
  //         image: collection?.metadata?.imageUrl || null,
  //         isSpam: false,
  //         name: collection?.name,
  //         onSaleCount: collection?.on_sale_count,
  //         volumeChange: {
  //           '1day': collection?.day1_volume_change,
  //           '7day': collection?.day7_volume_change,
  //           '30day': collection?.day30_volume_change,
  //         },
  //         tokenCount: collection?.token_count,
  //         ownerCount: collection?.owner_count,
  //         sampleImages: collection?.nfts?.map((x) => x?.image),
  //       }

  //       result?.push(mappedItem)
  //     })
  //   }

  //   return result
  // }

  // let topCollectionData: TopCollectionItem[] = []
  // useTopCollection(1000)?.then((res) => {
  //   if (res) {
  //     topCollectionData = remapData(res?.data?.data?.evmevm_collections)
  //   }
  // })

  // const { data, isValidating } = useTrendingCollections(
  //   collectionQuery,
  //   chain.id,
  //   {
  //     fallbackData: [ssr.collections],
  //   }
  // )

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = 'allTime'

  switch (sortByTime) {
    case '30d':
      volumeKey = '30day'
      break
    case '7d':
      volumeKey = '7day'
      break
    case '24h':
      volumeKey = '1day'
      break
  }

  const collections = ssr?.collections || []

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$5',
          },

          '@xl': {
            px: '$6',
          },
        }}
      >
        <Flex direction="column">
          <Flex
            justify="between"
            align="start"
            css={{
              flexDirection: 'column',
              gap: 24,
              mb: '$4',
              '@bp800': {
                alignItems: 'center',
                flexDirection: 'row',
              },
            }}
          >
            <Text style="h4" as="h4">
              Collections
            </Text>
            {/* <Flex align="center" css={{ gap: '$4' }}>
              <CollectionsTimeDropdown
                compact={compactToggleNames && isMounted}
                option={sortByTime}
                onOptionSelected={(option) => {
                  setSortByTime(option)
                }}
              />
              <ChainToggle />
            </Flex> */}
          </Flex>
          {isSSR || !isMounted ? null : (
            <CollectionRankingsTable
              collections={collections}
              volumeKey={'allTime'}
              loading={isValidating}
            />
          )}
        </Flex>
        {isValidating && (
          <Flex align="center" justify="center" css={{ py: '$4' }}>
            <LoadingSpinner />
          </Flex>
        )}
      </Box>
    </Layout>
  )
}

type TrendingCollectionsResponse =
  paths['/collections/trending/v1']['get']['responses']['200']['schema']

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    // collections: TrendingCollectionsResponse
    collections: TopCollectionItem[]
  }
}> = async ({ res, params }) => {
  // let collectionQuery: paths['/collections/trending/v1']['get']['parameters']['query'] =
  //   {
  //     limit: 1000,
  //     period: '30d',
  //   }

  // const chainPrefix = params?.chain || ''
  // const chain =
  //   supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
  //   DefaultChain
  // const query = { ...collectionQuery }

  // const response = await fetcher(
  //   `${chain.reservoirBaseUrl}/collections/trending/v1`,
  //   query,
  //   {
  //     headers: {
  //       'x-api-key': process.env.RESERVOIR_API_KEY || '',
  //     },
  //   }
  // )
  // res.setHeader(
  //   'Cache-Control',
  //   'public, s-maxage=30, stale-while-revalidate=60'
  // )

  const remapData = (collectionList: TopCollectionRawItem[]) => {
    let result: TopCollectionItem[] = []
    if (collectionList?.length > 0) {
      collectionList?.forEach((collection) => {
        const mappedItem: TopCollectionItem = {
          banner: collection?.metadata?.bannerImageUrl || null,
          collectionVolume: {
            '1day': collection?.day1_volume
              ? Number(formatUnits(BigInt(collection?.day1_volume), 18))
              : 0,
            '7day': collection?.day7_volume
              ? Number(formatUnits(BigInt(collection?.day7_volume), 18))
              : 0,
            '30day': collection?.day30_volume
              ? Number(formatUnits(BigInt(collection?.day30_volume), 18))
              : 0,
            allTime: collection?.all_time_volume
              ? Number(formatUnits(BigInt(collection?.all_time_volume), 18))
              : 0,
          },
          count: collection?.token_count,
          countPercentChange: null,
          description: collection?.metadata?.description || null,
          floorAsk: {
            id: collection?.floor_sell_id,
            price: {
              amount: {
                decimal: collection?.floor_sell_value
                  ? Number(
                      formatUnits(BigInt(collection?.floor_sell_value), 18)
                    )
                  : 0,
                native: collection?.floor_sell_value
                  ? Number(
                      formatUnits(BigInt(collection?.floor_sell_value), 18)
                    )
                  : 0,
                raw: collection?.floor_sell_value?.toString() || null,
                usd: null,
              },
              currency: {
                contract: zeroAddress,
              },
            },
            sourceDomain: '',
          },
          floorAskPercentChange: null,
          volume: collection?.all_time_volume,
          id:
            collection?.contract?.indexOf('\\') > -1
              ? collection?.contract?.replace('\\', '0')
              : collection?.contract,
          image: collection?.metadata?.imageUrl || null,
          isSpam: false,
          name: collection?.name,
          onSaleCount: collection?.on_sale_count,
          volumeChange: {
            '1day': collection?.day1_volume_change,
            '7day': collection?.day7_volume_change,
            '30day': collection?.day30_volume_change,
          },
          tokenCount: collection?.token_count,
          ownerCount: collection?.owner_count,
          sampleImages: collection?.nfts?.map((x) => x?.image),
        }

        result?.push(mappedItem)
      })
    }

    return result
  }

  let topCollectionData: TopCollectionItem[] = []
  await useTopCollection(100)?.then((res) => {
    if (res) {
      topCollectionData = remapData(res?.data?.data?.evmevm_collections)
    }
  })

  return {
    props: { ssr: { collections: topCollectionData } },
  }
}

export default IndexPage
