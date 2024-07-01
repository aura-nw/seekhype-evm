import { useTrendingMints } from '@sh-reservoir0x/reservoir-kit-ui'
import { paths } from '@sh-reservoir0x/reservoir-sdk'
import { Head } from 'components/Head'
import Layout from 'components/Layout'
import ChainToggle from 'components/common/ChainToggle'
import LoadingSpinner from 'components/common/LoadingSpinner'
import MintTypeSelector, {
  MintTypeOption,
} from 'components/common/MintTypeSelector'
import MintsPeriodDropdown, {
  MintsSortingOption,
} from 'components/common/MintsPeriodDropdown'
import { Box, Flex, Text } from 'components/primitives'
import { MintRankingsTable } from 'components/rankings/MintRankingsTable'
import { ChainContext } from 'context/ChainContextProvider'
import dayjs from 'dayjs'
import { useMounted } from 'hooks'
import { useTopCollectionMint } from 'hooks/useTopCollectionMint'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { NORMALIZE_ROYALTIES } from 'pages/_app'
import { useContext, useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import supportedChains, { DefaultChain } from 'utils/chains'
import fetcher from 'utils/fetcher'
import { formatUnits, zeroAddress } from 'viem'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const isSmallDevice = useMediaQuery({ maxWidth: 600 })

  const [mintType, setMintType] = useState<MintTypeOption>('any')
  const [sortByPeriod, setSortByPeriod] = useState<MintsSortingOption>('30d')
  const [mints, setMints] = useState<TopCollectionMintItem[]>([])

  let mintQuery: Parameters<typeof useTrendingMints>['0'] = {
    limit: 20,
    period: sortByPeriod,
    type: mintType,
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

  const remapData = (collectionList: TopCollectionMintRawItem[]) => {
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
                startTime: collectionMint?.start_time
                  ? dayjs(collectionMint?.start_time).unix()
                  : '',
                endTime: collectionMint?.end_time
                  ? dayjs(collectionMint?.end_time).unix()
                  : '',
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

  useEffect(() => {
    let topCollectionData: TopCollectionMintItem[] = []
    useTopCollectionMint(1000, mintType)?.then((res) => {
      if (res) {
        topCollectionData = remapData(res?.data?.data?.evmcollection_mints)
        setMints(topCollectionData?.slice(0, 50))
      }
    })
  }, [mintType])

  // const { data, isValidating } = useTrendingMints(mintQuery, chain.id, {
  //   fallbackData: [ssr.mints],
  // })
  const isValidating = false

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
              Trending Mints
            </Text>
            <Flex align="center" css={{ gap: '$4' }}>
              {!isSmallDevice && (
                <MintTypeSelector
                  option={mintType}
                  onOptionSelected={setMintType}
                />
              )}
              {/* <MintsPeriodDropdown
                compact={compactToggleNames && isMounted}
                option={sortByPeriod}
                onOptionSelected={(option) => {
                  setSortByPeriod(option)
                }}
              />
              <ChainToggle /> */}
            </Flex>
            {isSmallDevice && (
              <MintTypeSelector
                option={mintType}
                onOptionSelected={setMintType}
              />
            )}
          </Flex>
          {isSSR || !isMounted ? null : (
            <MintRankingsTable mints={mints} loading={isValidating} />
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

type MintsSchema =
  paths['/collections/trending-mints/v1']['get']['responses']['200']['schema']

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    // mints: MintsSchema
    mints: TopCollectionMintItem[]
  }
}> = async ({ res, params }) => {
  // const mintsQuery: paths['/collections/trending-mints/v1']['get']['parameters']['query'] =
  //   {
  //     limit: 20,
  //     period: '30d',
  //     type: 'any',
  //   }

  // const chainPrefix = params?.chain || ''

  // const { reservoirBaseUrl } =
  //   supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
  //   DefaultChain

  // const query = { ...mintsQuery, normalizeRoyalties: NORMALIZE_ROYALTIES }

  // const response = await fetcher(
  //   `${reservoirBaseUrl}/collections/trending-mints/v1`,
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

  const remapData = (collectionList: TopCollectionMintRawItem[]) => {
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

          result?.push(mappedItem)
        }
      })
    }

    return result
  }

  let topCollectionData: TopCollectionMintItem[] = []
  await useTopCollectionMint(1000, 'free')?.then((res) => {
    if (res) {
      topCollectionData = remapData(res?.data?.data?.evmcollection_mints)
    }
  })

  return {
    props: { ssr: { mints: topCollectionData } },
  }
}

export default IndexPage
