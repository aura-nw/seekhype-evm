import { paths } from '@sh-reservoir0x/reservoir-sdk'
import { Head } from 'components/Head'
import Layout from 'components/Layout'
import { Footer } from 'components/home/Footer'
import { Box, Button, Flex, Text } from 'components/primitives'
import { ChainContext } from 'context/ChainContextProvider'
import { useMarketplaceChain, useMounted } from 'hooks'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import Link from 'next/link'
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import supportedChains, { DefaultChain } from 'utils/chains'
import * as Tabs from '@radix-ui/react-tabs'
import {
  useTrendingCollections,
  useTrendingMints,
} from '@sh-reservoir0x/reservoir-kit-ui'
import ChainToggle from 'components/common/ChainToggle'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import MintsPeriodDropdown, {
  MintsSortingOption,
} from 'components/common/MintsPeriodDropdown'
import { FeaturedCards } from 'components/home/FeaturedCards'
import { TabsContent, TabsList, TabsTrigger } from 'components/primitives/Tab'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { MintRankingsTable } from 'components/rankings/MintRankingsTable'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import { useMediaQuery } from 'react-responsive'
import fetcher from 'utils/fetcher'
import Image from 'next/image'
import { formatUnits, zeroAddress } from 'viem'
import { useTopCollection } from 'hooks/useTopCollection'
import { useTopCollectionMint } from 'hooks/useTopCollectionMint'
import dayjs from 'dayjs'
import { useFeaturedCollection } from 'hooks/useFeaturedCollection'

type TabValue = 'collections' | 'mints'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const marketplaceChain = useMarketplaceChain()
  const isMounted = useMounted()

  // not sure if there is a better way to fix this
  const { theme: nextTheme } = useTheme()
  const [theme, setTheme] = useState<string | null>(null)
  useEffect(() => {
    if (nextTheme) {
      setTheme(nextTheme)
    }
  }, [nextTheme])

  const isSSR = typeof window === 'undefined'
  const isSmallDevice = useMediaQuery({ query: '(max-width: 800px)' })

  const [tab, setTab] = useState<TabValue>('collections')
  const [sortByTime, setSortByTime] = useState<CollectionsSortingOption>('30d')

  const [sortByPeriod, setSortByPeriod] = useState<MintsSortingOption>('30d')

  let mintsQuery: Parameters<typeof useTrendingMints>['0'] = {
    limit: 20,
    period: sortByPeriod,
    type: 'any',
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

  const trendingCollections = ssr?.trendingCollections
  const isTrendingCollectionsValidating = false
  // const {
  //   data: trendingCollections,
  //   isValidating: isTrendingCollectionsValidating,
  // } = useTrendingCollections(
  //   {
  //     limit: 20,
  //     sortBy: 'volume',
  //     period: sortByTime,
  //   },
  //   chain.id,
  //   {
  //     fallbackData: ssr.trendingCollections,
  //     keepPreviousData: true,
  //   }
  // )

  const featuredCollections = ssr?.featuredCollections?.slice(0, 5)
  const isFeaturedCollectionsValidating = false
  // const {
  //   data: featuredCollections,
  //   isValidating: isFeaturedCollectionsValidating,
  // } = useTrendingCollections(
  //   {
  //     limit: 20,
  //     sortBy: 'sales',
  //     period: '30d',
  //   },
  //   chain.id,
  //   {
  //     fallbackData: ssr.featuredCollections,
  //     keepPreviousData: true,
  //   }
  // )

  const trendingMints =
    ssr?.trendingMints?.length > 0 ? ssr?.trendingMints?.slice(0, 50) : []
  const isTrendingMintsValidating = false
  // const { data: trendingMints, isValidating: isTrendingMintsValidating } =
  //   useTrendingMints({ ...mintsQuery }, chain.id, {
  //     fallbackData: ssr.trendingMints,
  //     keepPreviousData: true,
  //   })

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = '1day'

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

  return (
    <Layout>
      <Head />

      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            px: '$5',
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <Box
          css={{
            mb: 64,
          }}
        >
          {/* <Flex
            justify="between"
            align="start"
            css={{
              gap: 24,
              mb: '$5',
            }}
          >
            <img
              style={{ width: '100%', height: '500px', objectFit: 'fill' }}
              src="/home/banner/seekhype.png"
            ></img>
          </Flex> */}

          <Flex
            justify="between"
            align="start"
            css={{
              gap: 24,
              mb: '$4',
            }}
          >
            <Text style="h4" as="h4">
              FEATURED SHOWCASES
            </Text>
          </Flex>
          <Box
            css={{
              height: '100%',
            }}
          >
            <FeaturedCards collections={featuredCollections} />
          </Box>
        </Box>

        <Tabs.Root
          onValueChange={(tab) => setTab(tab as TabValue)}
          defaultValue="collections"
        >
          <Flex justify="between" align="start" css={{ mb: '$3' }}>
            <Text style="h4" as="h4">
              TOP HYPE COLLECTIONS
            </Text>
            {/* {!isSmallDevice && (
              <Flex
                align="center"
                css={{
                  gap: '$4',
                }}
              >
                {tab === 'collections' ? (
                  <CollectionsTimeDropdown
                    compact={isSmallDevice && isMounted}
                    option={sortByTime}
                    onOptionSelected={(option) => {
                      setSortByTime(option)
                    }}
                  />
                ) : (
                  <MintsPeriodDropdown
                    option={sortByPeriod}
                    onOptionSelected={setSortByPeriod}
                  />
                )}
                <ChainToggle />
              </Flex>
            )} */}
          </Flex>
          <TabsList css={{ mb: 24, mt: 0, borderBottom: 'none' }}>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="mints">Mints</TabsTrigger>
          </TabsList>
          {/* {isSmallDevice && (
            <Flex
              justify="between"
              align="center"
              css={{
                gap: 24,
                mb: '$4',
              }}
            >
              <Flex align="center" css={{ gap: '$4' }}>
                {tab === 'collections' ? (
                  <CollectionsTimeDropdown
                    compact={isSmallDevice && isMounted}
                    option={sortByTime}
                    onOptionSelected={(option) => {
                      setSortByTime(option)
                    }}
                  />
                ) : (
                  <MintsPeriodDropdown
                    option={sortByPeriod}
                    onOptionSelected={setSortByPeriod}
                  />
                )}
                <ChainToggle />
              </Flex>
            </Flex>
          )} */}
          <TabsContent value="collections">
            <Box
              css={{
                height: '100%',
              }}
            >
              <Flex direction="column">
                {isSSR || !isMounted ? null : (
                  <CollectionRankingsTable
                    collections={trendingCollections || []}
                    volumeKey={'allTime'}
                    loading={isTrendingCollectionsValidating}
                    isIndex={true}
                  />
                )}
                <Box
                  css={{
                    display: isTrendingCollectionsValidating ? 'none' : 'block',
                  }}
                ></Box>
              </Flex>
            </Box>
          </TabsContent>
          <TabsContent value="mints">
            <Box
              css={{
                height: '100%',
              }}
            >
              <Flex direction="column">
                {isSSR || !isMounted ? null : (
                  <MintRankingsTable
                    mints={trendingMints || []}
                    loading={isTrendingMintsValidating}
                    isIndex={true}
                  />
                )}
                <Box
                  css={{
                    display: isTrendingCollectionsValidating ? 'none' : 'block',
                  }}
                ></Box>
              </Flex>
            </Box>
          </TabsContent>
        </Tabs.Root>
        <Box css={{ my: '$5' }}>
          <Link href={`/${marketplaceChain.routePrefix}/${tab}/trending`}>
            <Button>See More</Button>
          </Link>
        </Box>
      </Box>

      {/* <Footer /> */}
    </Layout>
  )
}

type TrendingCollectionsSchema =
  paths['/collections/trending/v1']['get']['responses']['200']['schema']
type TrendingMintsSchema =
  paths['/collections/trending-mints/v1']['get']['responses']['200']['schema']

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    trendingMints: TopCollectionMintItem[]
    trendingCollections: TopCollectionItem[]
    featuredCollections: TopCollectionItem[]
  }
}> = async ({ params, res }) => {
  const chainPrefix = params?.chain || ''
  const { reservoirBaseUrl } =
    supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
    DefaultChain

  const headers: RequestInit = {
    headers: {
      'x-api-key': process.env.RESERVOIR_API_KEY || '',
    },
  }

  let trendingCollectionsQuery: paths['/collections/trending/v1']['get']['parameters']['query'] =
    {
      period: '30d',
      limit: 20,
      sortBy: 'volume',
    }

  const trendingCollectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending/v1`,
    trendingCollectionsQuery,
    headers
  )

  let featuredCollectionQuery: paths['/collections/trending/v1']['get']['parameters']['query'] =
    {
      period: '30d',
      limit: 20,
      sortBy: 'sales',
    }

  const featuredCollectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending/v1`,
    featuredCollectionQuery,
    headers
  )

  let trendingMintsQuery: paths['/collections/trending-mints/v1']['get']['parameters']['query'] =
    {
      period: '24h',
      limit: 20,
      type: 'any',
    }

  const trendingMintsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending-mints/v1`,
    trendingMintsQuery,
    headers
  )

  const promises = await Promise.allSettled([
    trendingCollectionsPromise,
    featuredCollectionsPromise,
    trendingMintsPromise,
  ]).catch((e) => {
    console.error(e)
  })

  // top collection
  const remapTopCollectionData = (collectionList: TopCollectionRawItem[]) => {
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
      topCollectionData = remapTopCollectionData(
        res?.data?.data?.evmevm_collections
      )
    }
  })

  // const trendingCollections: Props['ssr']['trendingCollections'] =
  //   promises?.[0].status === 'fulfilled' && promises[0].value.data
  //     ? (promises[0].value.data as Props['ssr']['trendingCollections'])
  //     : {}
  const trendingCollections = topCollectionData

  // featured showcase
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

  let featuredCollectionData: TopCollectionItem[] = []
  await useFeaturedCollection(5)?.then((res) => {
    if (res) {
      featuredCollectionData = remapData(res?.data?.data?.evmevm_collections)
    }
  })

  // const featuredCollections: Props['ssr']['featuredCollections'] =
  //   promises?.[1].status === 'fulfilled' && promises[1].value.data
  //     ? (promises[1].value.data as Props['ssr']['featuredCollections'])
  //     : {}

  // const featuredCollections =
  //   featuredCollectionData?.length > 0
  //     ? featuredCollectionData
  //     : topCollectionData

  const featuredCollections = featuredCollectionData

  // top collection mint
  const remapMintData = (collectionList: TopCollectionMintRawItem[]) => {
    let result: TopCollectionMintItem[] = []
    if (collectionList?.length > 0) {
      collectionList?.forEach((collectionMint) => {
        const existedCollectionIndex = result?.findIndex(
          (x) => x?.id === collectionMint?.collection_id
        )

        if (existedCollectionIndex > -1) {
          result[existedCollectionIndex]?.mintStages?.push({
            stage: collectionMint?.stage,
            kind: collectionMint?.kind,
            price: {
              currency: {
                contract: zeroAddress,
              },
              amount: {
                raw: collectionMint?.price,
                decimal: collectionMint?.price
                  ? Number(formatUnits(BigInt(collectionMint?.price), 18))
                  : 0,
                native: collectionMint?.price
                  ? Number(formatUnits(BigInt(collectionMint?.price), 18))
                  : 0,
              },
            },
            startTime: dayjs(collectionMint?.start_time).unix(),
            endTime: dayjs(collectionMint?.end_time).unix(),
          })
        } else {
          const mappedItem: TopCollectionMintItem = {
            banner:
              collectionMint?.collection?.metadata?.bannerImageUrl || null,
            collectionVolume: {
              '1day': collectionMint?.collection?.day1_volume
                ? Number(
                    formatUnits(
                      BigInt(collectionMint?.collection?.day1_volume),
                      18
                    )
                  )
                : 0,
              '7day': collectionMint?.collection?.day7_volume
                ? Number(
                    formatUnits(
                      BigInt(collectionMint?.collection?.day7_volume),
                      18
                    )
                  )
                : 0,
              '30day': collectionMint?.collection?.day30_volume
                ? Number(
                    formatUnits(
                      BigInt(collectionMint?.collection?.day30_volume),
                      18
                    )
                  )
                : 0,
              allTime: collectionMint?.collection?.all_time_volume
                ? Number(
                    formatUnits(
                      BigInt(collectionMint?.collection?.all_time_volume),
                      18
                    )
                  )
                : 0,
            },
            floorAsk: {
              id: collectionMint?.collection?.floor_sell_id,
              price: {
                amount: {
                  decimal: collectionMint?.collection?.floor_sell_value
                    ? Number(
                        formatUnits(
                          BigInt(collectionMint?.collection?.floor_sell_value),
                          18
                        )
                      )
                    : 0,
                  native: collectionMint?.collection?.floor_sell_value
                    ? Number(
                        formatUnits(
                          BigInt(collectionMint?.collection?.floor_sell_value),
                          18
                        )
                      )
                    : 0,
                  raw:
                    collectionMint?.collection?.floor_sell_value?.toString() ||
                    null,
                  usd: null,
                },
                currency: {
                  contract: zeroAddress,
                },
              },
              sourceDomain: '',
            },
            id: collectionMint?.collection_id,
            image: collectionMint?.collection?.metadata?.imageUrl || null,
            isSpam: false,
            name: collectionMint?.collection?.name,
            onSaleCount: collectionMint?.collection?.on_sale_count,
            volumeChange: {
              '1day': collectionMint?.collection?.day1_volume_change,
              '7day': collectionMint?.collection?.day7_volume_change,
              '30day': collectionMint?.collection?.day30_volume_change,
            },
            tokenCount: collectionMint?.collection?.token_count,
            ownerCount: collectionMint?.collection?.owner_count,
            sampleImages: collectionMint?.collection?.nfts?.map(
              (x) => x?.image
            ),
            description:
              collectionMint?.collection?.metadata?.description || null,
            isMinting: collectionMint?.collection?.is_minting,
            mintType: '',
            mintPrice: collectionMint?.price,
            maxSupply: collectionMint?.max_supply,
            mintStandard: collectionMint?.mint_standard?.standard,
            createdAt: collectionMint?.created_at,
            mintCount: collectionMint?.collection?.nfts_realtime_count,
            sixHourCount: 0,
            oneHourCount: 0,
            mintVolume: collectionMint?.collection?.all_time_volume
              ? Number(
                  formatUnits(
                    BigInt(collectionMint?.collection?.all_time_volume),
                    18
                  )
                )
              : 0,
            mintStages: [
              {
                stage: collectionMint?.stage,
                kind: collectionMint?.kind,
                price: {
                  currency: {
                    contract: zeroAddress,
                  },
                  amount: {
                    raw: collectionMint?.price,
                    decimal: collectionMint?.price
                      ? Number(formatUnits(BigInt(collectionMint?.price), 18))
                      : 0,
                    native: collectionMint?.price
                      ? Number(formatUnits(BigInt(collectionMint?.price), 18))
                      : 0,
                  },
                },
                startTime: dayjs(collectionMint?.start_time).unix(),
                endTime: dayjs(collectionMint?.end_time).unix(),
              },
            ],
          }
          if (mappedItem.mintStandard === 'zora') {
            result?.push(mappedItem)
          }
        }
      })
    }

    return result
  }

  let topCollectionMintData: TopCollectionMintItem[] = []
  await useTopCollectionMint(1000)?.then((res) => {
    if (res) {
      topCollectionMintData = remapMintData(
        res?.data?.data?.evmcollection_mints
      )
    }
  })

  // const trendingMints: Props['ssr']['trendingMints'] =
  //   promises?.[1].status === 'fulfilled' && promises[1].value.data
  //     ? (promises[1].value.data as Props['ssr']['trendingMints'])
  //     : {}
  const trendingMints = topCollectionMintData

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=120, stale-while-revalidate=180'
  )

  return {
    props: { ssr: { trendingCollections, trendingMints, featuredCollections } },
  }
}

export default Home
