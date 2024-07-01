import React, {
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  useContext,
} from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
// import { MintStep, MintModal } from '@sh-reservoir0x/reservoir-kit-ui'
import { MintStep, MintModal } from '@sh-reservoir0x/reservoir-kit-ui'
import { useMarketplaceChain } from 'hooks'
import { CSS } from '@stitches/react'
import { Button } from 'components/primitives'
import { SWRResponse } from 'swr'
import { ReferralContext } from 'context/ReferralContextProvider'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from 'components/ConnectWalletButton'

type Props = {
  collectionId?: string
  tokenId?: string
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  buttonChildren?: ReactNode
  mutate?: SWRResponse['mutate']
  openState?: ComponentPropsWithoutRef<typeof MintModal>['openState']
  disabled?: boolean
  maxMintQuantity?: number
  maxMintPerWallet?: number
}

const Mint: FC<Props> = ({
  collectionId,
  tokenId,
  buttonCss,
  buttonProps,
  buttonChildren,
  mutate,
  openState,
  disabled,
  maxMintQuantity,
  maxMintPerWallet
}) => {
  const { openConnectModal } = useConnectModal()
  const marketplaceChain = useMarketplaceChain()
  const { feesOnTop } = useContext(ReferralContext)
  const contract = collectionId?.split(':')?.[0]
  const token = tokenId ? `${contract}:${tokenId}` : undefined
  const { isConnected } = useAccount()

  return isConnected ? (
    <MintModal
      trigger={
        <Button
          css={buttonCss}
          color="primary"
          {...buttonProps}
          disabled={disabled}
        >
          {buttonChildren}
        </Button>
      }
      collectionId={collectionId}
      token={token}
      openState={openState}
      feesOnTopUsd={feesOnTop}
      chainId={marketplaceChain.id}
      onConnectWallet={() => {
        openConnectModal?.()
      }}
      onClose={(data, currentStep) => {
        if (mutate && currentStep == MintStep.Complete) mutate()
      }}
      maxMintQuantity={maxMintQuantity}
      maxMintPerWallet={maxMintPerWallet}
    />
  ) : (
    <Button
      css={buttonCss}
      color="primary"
      {...buttonProps}
      onClick={openConnectModal}
    >
      {buttonChildren}
    </Button>
  )
}

export default Mint
