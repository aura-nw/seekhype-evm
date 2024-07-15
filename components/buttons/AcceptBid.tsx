import {
  AcceptBidModal,
  AcceptBidStep,
  useDynamicTokens,
} from '@sh-reservoir0x/reservoir-kit-ui'
import {
  cloneElement,
  ComponentProps,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import { CSS } from '@stitches/react'
import { SWRResponse } from 'swr'
import { Button } from 'components/primitives'
import { useAccount, useWalletClient } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from '../../context/ToastContextProvider'
import { useMarketplaceChain } from 'hooks'

type Props = {
  tokenId?: string
  bidId?: string
  collectionId?: string
  disabled?: boolean
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
  buttonCss?: CSS
  buttonChildren?: ReactNode
  buttonProps?: ComponentProps<typeof Button>
  collectionRoyalty?: number
  isAcceptHighestBid?: boolean
  mutate?: SWRResponse['mutate']
}

const AcceptBid: FC<Props> = ({
  tokenId,
  bidId,
  collectionId,
  disabled,
  openState,
  buttonCss,
  buttonChildren,
  buttonProps,
  collectionRoyalty,
  isAcceptHighestBid,
  mutate,
}) => {
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)

  const marketplaceChain = useMarketplaceChain()

  const { data: signer } = useWalletClient()

  const trigger = (
    <Button
      css={buttonCss}
      color="gray3"
      disabled={disabled}
      corners={'pill'}
      {...buttonProps}
      onClick={() => {
        if (mutate && isAcceptHighestBid) {
          mutate()
        }
      }}
    >
      {buttonChildren}
    </Button>
  )

  const tokens = useMemo(() => {
    return collectionId && tokenId
      ? [
          {
            collectionId: collectionId,
            tokenId: tokenId,
            bidIds: bidId ? [bidId] : [],
            royalty: collectionRoyalty,
          },
        ]
      : []
  }, [collectionId, tokenId, bidId])

  if (isDisconnected) {
    return cloneElement(trigger, {
      onClick: async () => {
        if (!signer) {
          openConnectModal?.()
        }
      },
    })
  } else
    return (
      <AcceptBidModal
        trigger={trigger}
        openState={openState}
        tokens={tokens}
        chainId={marketplaceChain.id}
        onClose={(data, stepData, currentStep) => {
          if (mutate) {
            mutate()
          }
        }}
        onBidAcceptError={(error: any) => {
          if (error?.type === 'price mismatch') {
            addToast?.({
              title: 'Could not accept offer',
              description: 'Offer was lower than expected.',
            })
            return
          }
          // Handle user rejection
          if (error?.code === 4001) {
            addToast?.({
              title: 'User canceled transaction',
              description: 'You have canceled the transaction.',
            })
            return
          }
          addToast?.({
            title: 'Could not accept offer',
            description: 'The transaction was not completed.',
          })
        }}
        onPointerDownOutside={(e) => {
          const privyLayer = document.getElementById('privy-dialog')

          const clickedInsidePrivyLayer =
            privyLayer && e.target
              ? privyLayer.contains(e.target as Node)
              : false

          if (clickedInsidePrivyLayer) {
            e.preventDefault()
          }
        }}
      />
    )
}

export default AcceptBid
