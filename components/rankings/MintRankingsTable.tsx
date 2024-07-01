import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTrendingMints } from '@sh-reservoir0x/reservoir-kit-ui'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import { NAVBAR_HEIGHT } from 'components/navbar'
import {
  Box,
  Flex,
  FormatCryptoCurrency,
  HeaderRow,
  TableCell,
  TableRow,
  Text,
  Tooltip,
} from 'components/primitives'
import Img from 'components/primitives/Img'
import { useMarketplaceChain } from 'hooks'
import Link from 'next/link'
import { FC, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { formatNumber } from 'utils/numbers'
import optimizeImage from 'utils/optimizeImage'
import titleCase from 'utils/titleCase'
import { useCountAllowList } from 'hooks/useCountAllowList'
import dayjs from 'dayjs'

type Props = {
  // mints: NonNullable<ReturnType<typeof useTrendingMints>['data']>
  mints: TopCollectionMintItem[]
  loading?: boolean
  isIndex?: boolean
}

const gridColumns = {
  gridTemplateColumns: '520px repeat(3, 0.5fr) 250px',
  '@md': {
    gridTemplateColumns: '420px 1fr 1fr 1fr',
  },

  '@lg': {
    gridTemplateColumns: '360px repeat(3, 0.5fr) 250px',
  },

  '@xl': {
    gridTemplateColumns: '520px repeat(3, 0.5fr) 250px',
  },
}

export const MintRankingsTable: FC<Props> = ({ mints, loading, isIndex }) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  mints = sortTable(mints)
  return (
    <>
      {!loading && mints && mints.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          css={{ py: '$6', gap: '$4', width: '100%' }}
        >
          <Text css={{ color: '$gray11' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
          </Text>
          <Text css={{ color: '$gray11' }}>No mints found</Text>
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          {isSmallDevice ? (
            <Flex
              justify="between"
              css={{ mb: '$4', '@md': { display: 'none' } }}
            >
              <Text style="subtitle3" color="subtle">
                Collection
              </Text>
              <Text style="subtitle3" color="subtle">
                Total Mints
              </Text>
            </Flex>
          ) : (
            <TableHeading />
          )}
          <Flex direction="column" css={{ position: 'relative' }}>
            {mints?.map((mint, i) => {
              return !isIndex ? (
                <RankingsTableRow mint={mint} rank={(i += 1)} />
              ) : i < 5 ? (
                <RankingsTableRow mint={mint} rank={(i += 1)} />
              ) : (
                <></>
              )
            })}
          </Flex>
        </Flex>
      )}
    </>
  )
}

type RankingsTableRowProps = {
  // mint: NonNullable<ReturnType<typeof useTrendingMints>['data']>[0]
  mint: any[0]
  rank: number
}

const RankingsTableRow: FC<RankingsTableRowProps> = ({ mint, rank }) => {
  const { routePrefix } = useMarketplaceChain()
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const [allowListQuantity, setAllowListQuantity] = useState<number>(0)
  const [whitelistMaxPerWallet, setWhitelistMaxPerWallet] = useState<number>(0)

  const collectionImage = useMemo(() => {
    return optimizeImage(mint?.image || mint?.sampleImages?.[0], 250)
  }, [mint.image])

  const mintPrice = mint.mintPrice?.toString()

  const sampleImages: string[] = mint?.sampleImages || []

  let currentMintStage: any

  // if (mint?.id === '0x4bcc7398a71b80edc2f1b81d512f30071f4a914c') {
  // }
  currentMintStage = getCurrentPhase(mint?.mintStages as any[])

  const mintStageKindText =
    currentMintStage?.kind === 'public' ? 'Public' : 'Whitelist'

  // get allow list address quantity
  const onTooltipOpen = async () => {
    if (currentMintStage?.kind !== 'allowlist') {
      return
    }

    const countRes = await useCountAllowList(mint?.id)
    const currentPhase = countRes?.data?.data?.evmcollection_mints?.find(
      (x: any) => {
        if (x?.start_time && dayjs(x?.start_time).isBefore() && !x?.end_time) {
          return x
        }

        if (
          x?.start_time &&
          dayjs(x?.start_time).isBefore() &&
          x?.end_time &&
          dayjs(x?.end_time).isAfter()
        ) {
          return x
        }

        if (!x?.start_time && !x?.end_time) {
          return x
        }
      }
    )

    if (
      currentPhase?.allow_list_item?.allowlists_items &&
      currentPhase?.allow_list_item?.allowlists_items?.length > 0
    ) {
      setWhitelistMaxPerWallet(
        currentPhase?.allow_list_item?.allowlists_items[0].max_mints
      )

      setAllowListQuantity(
        currentPhase?.allow_list_item?.allowlists_items?.length
      )
    }
  }

  if (isSmallDevice) {
    return (
      <Link
        href={`/${routePrefix}/collection/${mint.id}`}
        style={{ display: 'inline-block', minWidth: 0, marginBottom: 24 }}
        key={mint.id}
      >
        <Flex align="center" css={{ cursor: 'pointer' }}>
          <Text css={{ mr: '$4', minWidth: 20 }} style="h6" color="subtle">
            {rank}
          </Text>
          <Img
            src={collectionImage}
            css={{ borderRadius: 8, width: 52, height: 52, objectFit: 'cover' }}
            alt="Collection Image"
            width={48}
            height={48}
            unoptimized
          />
          <Box css={{ ml: '$4', width: '100%', minWidth: 0 }}>
            <Flex align="center" css={{ gap: '$1', mb: 4, maxWidth: '80%' }}>
              <Text
                css={{
                  display: 'inline-block',
                }}
                style="subtitle1"
                ellipsify
              >
                {mint?.name}
              </Text>
              <OpenSeaVerified
                openseaVerificationStatus={mint?.openseaVerificationStatus}
              />
            </Flex>
            <Flex align="center">
              <Text css={{ mr: '$1', color: '$gray11' }} style="body3"></Text>
              <FormatCryptoCurrency
                amount={mint?.floorAsk?.price?.amount?.decimal}
                address={mint?.floorAsk?.price?.currency?.contract}
                decimals={mint?.floorAsk?.price?.currency?.decimals}
                logoHeight={16}
                maximumFractionDigits={2}
                textStyle="subtitle2"
              />
            </Flex>
          </Box>
          <Flex direction="column" align="end" css={{ gap: '$1' }}>
            <Text style="subtitle1">{mint?.mintCount?.toLocaleString()}</Text>
          </Flex>
        </Flex>
      </Link>
    )
  } else {
    return (
      <TableRow
        key={mint.id}
        css={{
          ...gridColumns,
        }}
      >
        <TableCell css={{ minWidth: 0 }}>
          <Link
            href={`/${routePrefix}/collection/${mint.id}`}
            style={{ display: 'inline-block', width: '100%', minWidth: 0 }}
          >
            <Flex
              align="center"
              css={{
                gap: '$4',
                cursor: 'pointer',
                minWidth: 0,
                overflow: 'hidden',
                width: '100$',
              }}
            >
              <Text css={{ minWidth: 15 }} style="h6" color="subtle">
                {rank}
              </Text>
              <Tooltip
                onOpenChange={onTooltipOpen}
                content={
                  <Box>
                    <Flex align={'center'} css={{ gap: '8px' }} justify={'end'}>
                      <Flex align={'center'} css={{ gap: '4px' }}>
                        <Text style={'body2'} color={'subtle'}>
                          {titleCase(mintStageKindText)}
                        </Text>
                        {currentMintStage?.kind === 'presale' && (
                          <Text style={'body2'} css={{ fontWeight: 700 }}>
                            {formatNumber(allowListQuantity)}
                          </Text>
                        )}
                      </Flex>
                      {/* <Text style={'body2'} color={'subtle'}>
                        •
                      </Text> */}
                      {/* {currentMintStage?.maxMints ? (
                        <Flex align={'center'} css={{ gap: '4px' }}>
                          <Text style={'body2'} css={{ fontWeight: 700 }}>
                            {formatNumber(currentMintStage?.maxMints)}
                          </Text>
                          <Text style={'body2'} color={'subtle'}>
                            {currentMintStage?.maxMints > 1 ? 'items' : 'item'}
                          </Text>
                        </Flex>
                      ) : (
                        <Flex align={'center'} css={{ gap: '4px' }}>
                          <Text style={'body2'} color={'subtle'}>
                            Unlimited
                          </Text>
                        </Flex>
                      )} */}

                      {currentMintStage?.maxMintsPerWallet ||
                      whitelistMaxPerWallet ? (
                        <Flex align={'center'} css={{ gap: '8px' }}>
                          <Text style={'body2'} color={'subtle'}>
                            •
                          </Text>
                          <Flex align={'center'} css={{ gap: '4px' }}>
                            <Text style={'body2'} color={'subtle'}>
                              Max
                            </Text>
                            <Text style={'body2'} css={{ fontWeight: 700 }}>
                              {currentMintStage?.kind === 'allowlist'
                                ? formatNumber(whitelistMaxPerWallet)
                                : formatNumber(
                                    currentMintStage?.maxMintsPerWallet
                                  )}{' '}
                              per wallet
                            </Text>
                          </Flex>
                        </Flex>
                      ) : (
                        <Flex align={'center'} css={{ gap: '8px' }}>
                          <Text style={'body2'} color={'subtle'}>
                            •
                          </Text>
                          <Text style="body2" css={{ fontWeight: 700 }}>
                            Unlimited per wallet
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                    {currentMintStage?.startTime &&
                      currentMintStage?.endTime && (
                        <Flex
                          align={'center'}
                          css={{ gap: '4px' }}
                          justify={'end'}
                        >
                          <Text style={'body3'} color={'subtle'}>
                            {dayjs
                              .unix(currentMintStage?.startTime)
                              .format('MMM DD, YYYY hh:mm a')}{' '}
                            -{' '}
                            {dayjs
                              .unix(currentMintStage?.endTime)
                              .format('MMM DD, YYYY hh:mm a')}
                          </Text>
                        </Flex>
                      )}
                  </Box>
                }
                side="right"
              >
                <Flex
                  align="center"
                  css={{
                    gap: '$4',
                    cursor: 'pointer',
                    minWidth: 0,
                    overflow: 'hidden',
                    width: '100$',
                  }}
                >
                  <Img
                    src={collectionImage}
                    css={{
                      borderRadius: 8,
                      width: 52,
                      height: 52,
                      objectFit: 'cover',
                    }}
                    alt="Collection Image"
                    width={52}
                    height={52}
                    unoptimized
                  />

                  <Flex css={{ gap: '$1', minWidth: 0 }} align="center">
                    <Text
                      css={{
                        display: 'inline-block',
                        minWidth: 0,
                      }}
                      style="h6"
                      ellipsify
                    >
                      {mint?.name}
                    </Text>
                    <OpenSeaVerified
                      openseaVerificationStatus={
                        mint?.openseaVerificationStatus
                      }
                    />
                  </Flex>
                </Flex>
              </Tooltip>
            </Flex>
          </Link>
        </TableCell>
        <TableCell>
          <Flex
            direction="column"
            align="start"
            justify="start"
            css={{ height: '100%' }}
          >
            {mintPrice !== '0' && mintPrice ? (
              <FormatCryptoCurrency
                amount={mintPrice}
                textStyle="subtitle1"
                logoHeight={14}
                maximumFractionDigits={2}
              />
            ) : (
              <Text style="subtitle1">Free mint</Text>
            )}
          </Flex>
        </TableCell>
        <TableCell>
          <Flex>
            <FormatCryptoCurrency
              amount={mint?.floorAsk?.price?.amount?.decimal}
              address={mint?.floorAsk?.price?.currency?.contract}
              decimals={mint?.floorAsk?.price?.currency?.decimals}
              textStyle="subtitle1"
              logoHeight={14}
              maximumFractionDigits={2}
            />
          </Flex>
        </TableCell>
        <TableCell>
          <Flex
            direction="column"
            align="start"
            justify="start"
            css={{ height: '100%' }}
          >
            <Text style="subtitle1">{mint?.mintCount?.toLocaleString()}</Text>
          </Flex>
        </TableCell>

        {/* <TableCell desktopOnly>
          <Text style="subtitle1">{mint?.oneHourCount?.toLocaleString()}</Text>
        </TableCell>

        <TableCell desktopOnly>
          <Text style="subtitle1">{mint?.sixHourCount?.toLocaleString()}</Text>
        </TableCell> */}

        <TableCell desktopOnly>
          <Flex
            css={{
              gap: '$2',
              minWidth: 0,
            }}
            justify={'end'}
          >
            {/** */}
            {sampleImages.map((image: string, i) => {
              if (image) {
                return (
                  <img
                    key={image + i}
                    src={optimizeImage(image, 104)}
                    loading="lazy"
                    style={{
                      borderRadius: 8,
                      width: 52,
                      height: 52,
                      objectFit: 'cover',
                    }}
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.style.visibility = 'hidden'
                    }}
                  />
                )
              }
              return null
            })}
          </Flex>
        </TableCell>
      </TableRow>
    )
  }
}

const headings = [
  'Collection',
  'Mint Price',
  'Floor Price',
  'Total Mints',
  'Recent Mints',
]

const TableHeading = () => (
  <HeaderRow
    css={{
      display: 'none',
      ...gridColumns,
      '@md': { display: 'grid', ...gridColumns['@md'] },
      position: 'sticky',
      top: NAVBAR_HEIGHT,
      backgroundColor: '$neutralBg',
      zIndex: 1,
    }}
  >
    {headings.map((heading, i) => (
      <TableCell
        desktopOnly={i > 3}
        key={heading}
        css={{ textAlign: i === headings.length - 1 ? 'right' : 'left' }}
      >
        <Text style="subtitle3" color="subtle">
          {heading}
        </Text>
      </TableCell>
    ))}
  </HeaderRow>
)

const getCurrentActivePhase = (mintstages: any[]): any => {
  if (mintstages?.length > 0) {
    const result = mintstages.find((x) => {
      if (x?.startTime && dayjs.unix(x?.startTime).isBefore() && !x?.endTime) {
        return x
      }

      if (
        x?.startTime &&
        dayjs.unix(x?.startTime).isBefore() &&
        x?.endTime &&
        dayjs.unix(x?.endTime).isAfter()
      ) {
        return x
      }

      if (!x?.startTime && !x?.endTime) {
        return x
      }
    })
    return result
  }

  return undefined
}

const getCurrentPhase = (mintstages: any[]): any => {
  let result = undefined

  if (mintstages?.length > 0) {
    mintstages = mintstages?.sort((a, b) => a?.startTime - b?.startTime)
    result = mintstages.find((x) => {
      // live
      if (x?.startTime && dayjs.unix(x?.startTime).isBefore() && !x?.endTime) {
        return x
      }

      if (
        x?.startTime &&
        dayjs.unix(x?.startTime).isBefore() &&
        x?.endTime &&
        dayjs.unix(x?.endTime).isAfter()
      ) {
        return x
      }

      if (!x?.startTime && !x?.endTime) {
        return x
      }

      // upcoming
      if (x?.startTime && dayjs.unix(x?.startTime).isAfter()) {
        return x
      }
    })
    return result
  }

  return result
}

const sortTable = (data: any) => {
  let newdata = data.map((element) => {
    const curentactivephase = getCurrentActivePhase(element.mintStages)
    if (curentactivephase) {
      element.currentActivePhase = curentactivephase
      element.status = 'live'
    } else {
      if (
        element.mintStages?.length > 0 &&
        element.mintStages[0]?.startTime &&
        dayjs.unix(element?.mintStages[0]?.startTime).isAfter()
      ) {
        element.status = 'upcomming'
      } else {
        element.status = 'end'
      }
    }
    return element
  })
  let liveData = newdata.filter((i) => i.status === 'live')
  let upcommingData = newdata.filter((i) => i.status === 'upcomming')
  let endData = newdata.filter((i) => i.status === 'end')
  liveData = liveData.sort(
    (a: any, b: any) =>
      new Date(b.currentActivePhase?.startTime).getTime() -
      new Date(a.currentActivePhase?.startTime).getTime()
  )
  upcommingData = upcommingData.sort(
    (a: any, b: any) =>
      new Date(b.mintStages[0]?.startTime).getTime() -
      new Date(a.mintStages[0]?.startTime).getTime()
  )
  // endData = endData.sort(
  //   (a: any, b: any) =>
  //     new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  // )
  const resultdata = liveData.concat(upcommingData, endData)
  return resultdata
}
