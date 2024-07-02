import { useCoinConversion, useTokens } from '@sh-reservoir0x/reservoir-kit-ui'
import {
  Flex,
  FormatCryptoCurrency,
  Text,
  Tooltip,
} from 'components/primitives'
import { useMarketplaceChain } from 'hooks'
import { FC } from 'react'
import { formatDollar } from 'utils/numbers'
import { formatUnits, parseUnits } from 'viem'
import { useAccount } from 'wagmi'

type Props = {
  token: ReturnType<typeof useTokens>['data'][0] | null
  usdPrice?: number
}

export const PriceData: FC<Props> = ({ token, usdPrice }) => {
  const { address } = useAccount()
  // const { proxyApi } = useMarketplaceChain()
  const { proxyApi } = useMarketplaceChain()
  const listSourceName = token?.market?.floorAsk?.source?.name as
    | string
    | undefined
  const listSourceDomain = token?.market?.floorAsk?.source?.domain as
    | string
    | undefined

  const offerSourceName = token?.market?.topBid?.source?.name as
    | string
    | undefined
  const offerSourceDomain = token?.market?.topBid?.source?.domain as
    | string
    | undefined

  const listSourceLogo = `${
    process.env.NEXT_PUBLIC_PROXY_URL
  }${proxyApi}/redirect/sources/${listSourceDomain || listSourceName}/logo/v2`
  // const listSourceLogo = `https://zora.co/assets/favicon/favicon.ico`

  const offerSourceLogo = `${
    process.env.NEXT_PUBLIC_PROXY_URL
  }${proxyApi}/redirect/sources/${offerSourceDomain || offerSourceName}/logo/v2`

  const listSourceRedirect = `${
    process.env.NEXT_PUBLIC_PROXY_URL
  }${proxyApi}/redirect/sources/${listSourceDomain || listSourceName}/tokens/${
    token?.token?.contract
  }:${token?.token?.tokenId}/link/v2`

  const offerSourceRedirect = `${
    process.env.NEXT_PUBLIC_PROXY_URL
  }${proxyApi}/redirect/sources/${
    offerSourceDomain || offerSourceName
  }/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`

  const isValidListing = token?.market?.floorAsk?.maker === token?.token?.owner

  const coinConversion = useCoinConversion('USD')
  const offerUsdPrice = coinConversion.length > 0 ? coinConversion[0].price : 0
  const usdPriceRaw = parseUnits(offerUsdPrice.toString(), 6)

  return (
    <Flex css={{ gap: '$6', pt: '$4', pb: '$5' }}>
      <Flex direction="column" align="start" css={{ gap: '$1' }}>
        <Text style="subtitle2">Price</Text>
        <Flex
          align="center"
          css={{
            flexDirection: 'column',
            '@bp400': { flexDirection: 'column', gap: '$2' },
          }}
        >
          <FormatCryptoCurrency
            amount={
              isValidListing
                ? token?.market?.floorAsk?.price?.amount?.raw
                : undefined
            }
            address={token?.market?.floorAsk?.price?.currency?.contract}
            decimals={token?.market?.floorAsk?.price?.currency?.decimals}
            textStyle="h4"
            logoHeight={20}
            maximumFractionDigits={2}
          />
          {usdPrice ? (
            <Text style="body3" css={{ color: '$gray11' }} ellipsify>
              {formatDollar(
                (isValidListing
                  ? token?.market?.floorAsk?.price?.amount?.decimal || 0
                  : 0) * usdPrice
              )}
            </Text>
          ) : null}
        </Flex>
        {/* {listSourceName && (
          <a
            href={listSourceRedirect}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Flex
              align="center"
              css={{
                borderRadius: 4,
                gap: '$1',
                width: 'max-content',
              }}
            >
              <img width="20px" height="20px" src={listSourceLogo} />
              <Text style="body3" css={{ color: '$gray11' }}>
                {listSourceName}
              </Text>
            </Flex>
          </a>
        )} */}
      </Flex>
      <Flex direction="column" align="start" css={{ gap: '$1' }}>
        <Text style="subtitle2">Top Offer</Text>
        <Flex
          align="center"
          css={{
            flexDirection: 'column',
            '@bp400': { flexDirection: 'column', gap: '$2' },
          }}
        >
          <Tooltip
            side="top"
            open={
              token?.market?.topBid?.price?.netAmount?.decimal
                ? undefined
                : false
            }
            content={
              <Flex justify="between" css={{ gap: '$2' }}>
                <Text style="body3">Net Amount</Text>
                <FormatCryptoCurrency
                  amount={token?.market?.topBid?.price?.netAmount?.decimal}
                  address={token?.market?.topBid?.price?.currency?.contract}
                  decimals={token?.market?.topBid?.price?.currency?.decimals}
                  textStyle="subtitle3"
                  logoHeight={14}
                  maximumFractionDigits={2}
                />
              </Flex>
            }
          >
            <Flex>
              <FormatCryptoCurrency
                amount={token?.market?.topBid?.price?.amount?.decimal}
                address={token?.market?.topBid?.price?.currency?.contract}
                decimals={token?.market?.topBid?.price?.currency?.decimals}
                textStyle="h4"
                logoHeight={20}
                maximumFractionDigits={2}
              />
            </Flex>
          </Tooltip>

          {token?.market?.topBid?.price?.amount?.raw ? (
            <Text style="body3" css={{ color: '$gray11' }} ellipsify>
              {formatDollar(
                Number(
                  formatUnits(
                    BigInt(token?.market?.topBid?.price?.amount?.raw || 0) *
                      usdPriceRaw,
                    24
                  )
                )
              )}
            </Text>
          ) : null}
        </Flex>
        {/* {offerSourceName && (
          <a
            href={offerSourceRedirect}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Flex
              align="center"
              css={{
                borderRadius: 4,
                gap: '$1',
                width: 'max-content',
              }}
            >
              <img width="20px" height="20px" src={offerSourceLogo} />
              <Text style="body3" css={{ color: '$gray11' }}>
                {offerSourceName}
              </Text>
            </Flex>
          </a>
        )} */}
      </Flex>
    </Flex>
  )
}
