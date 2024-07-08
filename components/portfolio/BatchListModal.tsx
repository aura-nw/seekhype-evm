import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  Currency,
  Listing,
  useReservoirClient,
} from '@sh-reservoir0x/reservoir-kit-ui'
import { Execute } from '@sh-reservoir0x/reservoir-sdk'
import LoadingSpinner from 'components/common/LoadingSpinner'
import { Modal } from 'components/common/Modal'
import TransactionProgress from 'components/common/TransactionProgress'
import BatchListings, {
  BatchListing,
  Marketplace,
} from 'components/portfolio/BatchListings'
import { Box, Button, Flex, Text } from 'components/primitives'
import ErrorWell from 'components/primitives/ErrorWell'
import dayjs from 'dayjs'
import { useMarketplaceChain } from 'hooks'
import { UserToken } from 'pages/portfolio/[[...address]]'
import { FC, useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useWalletClient,
  useSwitchChain,
  useConfig,
  createConfig,
} from 'wagmi'
import { ApprovalCollapsible } from './ApprovalCollapsible'
import {
  createPublicClient,
  encodeFunctionData,
  formatUnits,
  http,
  parseUnits,
  zeroAddress,
} from 'viem'
import useOnChainRoyalties, {
  OnChainRoyaltyReturnType,
} from 'hooks/useOnChainRoyalties'
import { aura } from 'utils/aura-chain'
import { ContractConfig } from 'components/common/common'
import { multicall } from '@wagmi/core'
import { chain } from 'lodash'
import { readContracts, writeContract } from '@wagmi/core'

enum BatchListStep {
  Approving,
  Complete,
}

export type BatchListingData = {
  listing: Listing
  token: UserToken
}

type BatchListModalStepData = {
  totalSteps: number
  stepProgress: number
  currentStep: Execute['steps'][0]
  listings: BatchListingData[]
}

type Props = {
  listings: BatchListing[]
  disabled: boolean
  onCloseComplete?: () => void
}

const orderFee = process.env.NEXT_PUBLIC_MARKETPLACE_FEE
const orderFees = orderFee ? [orderFee] : []

const BatchListModal: FC<Props> = ({ listings, disabled, onCloseComplete }) => {
  const [open, setOpen] = useState(false)
  const { data: wallet } = useWalletClient()
  const { openConnectModal } = useConnectModal()
  const { chain: activeChain, address } = useAccount()
  const marketplaceChain = useMarketplaceChain()
  const { switchChainAsync } = useSwitchChain()
  const isInTheWrongNetwork = Boolean(
    wallet && activeChain?.id !== marketplaceChain.id
  )
  const client = useReservoirClient()
  const [batchListStep, setBatchListStep] = useState<BatchListStep>(
    BatchListStep.Approving
  )
  const [stepData, setStepData] = useState<BatchListModalStepData | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [stepTitle, setStepTitle] = useState('')
  const [uniqueMarketplaces, setUniqueMarketplaces] = useState<Marketplace[]>(
    []
  )
  const [publicClient, setPublicClient] = useState<any>(undefined)
  const [isApproveModule, setIsApproveModule] = useState(false)
  const [isApproveNft, setIsApproveNft] = useState(false)

  useEffect(() => {
    setPublicClient(
      createPublicClient({
        batch: { multicall: true },
        chain: aura,
        transport: http(),
      })
    )
  }, [])

  const checkIsApproveModuleAsk = () => {
    publicClient
      ?.readContract({
        abi: [
          {
            inputs: [
              { internalType: 'address', name: '_user', type: 'address' },
              { internalType: 'address', name: '_module', type: 'address' },
            ],
            name: 'isModuleApproved',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        address: ContractConfig[aura?.id ? aura?.id : 1235]
          ?.ZORA_MODULE_MANAGER_ADDRESS as `0x${string}`,
        functionName: 'isModuleApproved',
        args: [
          address as `0x${string}`,
          ContractConfig[aura?.id ? aura?.id : 1235]
            ?.ASK1_1_MODULE_ADDRESS as `0x${string}`,
        ],
      })
      .then((res) => {
        if (res) {
          setIsApproveModule(true)
        }
      })
      .catch((err) => {
        setIsApproveModule(false)
        console.log(err)
        console.log('message: ' + err?.message)
      })
  }

  const checkIsApproveNft = () => {
    let isApproveNftContracts: any[] = []
    const approveNftAbi = {
      abi: [
        {
          constant: true,
          inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'operator', type: 'address' },
          ],
          name: 'isApprovedForAll',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
    }
    listings.forEach((listing) => {
      const result = {
        address: listing?.token?.token?.contract as `0x${string}`,
        ...approveNftAbi,
        args: [
          address as `0x${string}`,
          ContractConfig[aura?.id ? aura?.id : 1235]
            ?.ASK1_1_MODULE_ADDRESS as `0x${string}`,
        ],
        functionName: 'isApprovedForAll',
      }

      isApproveNftContracts.push(result)
    })

    const config = createConfig({
      chains: [aura],
      transports: {
        [aura?.id]: http(),
      },
    })

    readContracts(config, {
      contracts: isApproveNftContracts,
      allowFailure: false,
    }).then((res: any[]) => {
      setIsApproveNft(res?.find((x) => x === false) === undefined)
    })

    // publicClient
    //   ?.readContract({
    //     abi: [
    //       {
    //         constant: true,
    //         inputs: [
    //           { internalType: 'address', name: 'owner', type: 'address' },
    //           { internalType: 'address', name: 'operator', type: 'address' },
    //         ],
    //         name: 'isApprovedForAll',
    //         outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    //         payable: false,
    //         stateMutability: 'view',
    //         type: 'function',
    //       },
    //     ],
    //     address: contract as `0x${string}`,
    //     functionName: 'isApprovedForAll',
    //     args: [
    //       address as `0x${string}`,
    //       ContractConfig[aura?.id ? aura?.id : 1235]
    //         ?.ERC721TRANSFERHELPER as `0x${string}`,
    //     ],
    //   })
    //   .then((res) => {
    //     if (res) {
    //       setIsApproveNft(true)
    //     }
    //   })
    //   .catch((err) => {
    //     setIsApproveNft(false)
    //     console.log(err)
    //     console.log('message: ' + err?.message)
    //   })
  }

  useEffect(() => {
    if (publicClient) {
      checkIsApproveModuleAsk()
      checkIsApproveNft()
    }
  }, [publicClient, listings])

  const triggerListTokenContract = () => {
    setBatchListStep(BatchListStep.Approving)
    setStepData({
      totalSteps: 1,
      stepProgress: 1,
      currentStep: {
        kind: 'signature',
        action: '',
        description:
          'Please review and confirm to create the listing from your wallet.',
        id: '1',
      },
      listings: [],
    })
    // list token
    const calls = listings?.map((listing) => ({
      allowFailure: false,
      callData: encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: '_tokenContract',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: '_tokenId',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: '_askPrice',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: '_askCurrency',
                type: 'address',
              },
              {
                internalType: 'address',
                name: '_sellerFundsRecipient',
                type: 'address',
              },
              {
                internalType: 'uint16',
                name: '_findersFeeBps',
                type: 'uint16',
              },
            ],
            name: 'createAsk',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'createAsk',
        args: [
          listing?.token?.token?.contract as `0x${string}`,
          BigInt(Number(listing?.token?.token)),
          parseUnits(listing?.price, 18),
          zeroAddress,
          address as `0x${string}`,
          0,
        ],
      }),
    }))

    wallet
      ?.writeContract({
        abi: [
          {
            type: 'function',
            name: 'aggregate',
            inputs: [
              {
                name: 'calls',
                type: 'tuple[]',
                internalType: 'struct Multicall.Call[]',
                components: [
                  { name: 'allowFailure', type: 'bool', internalType: 'bool' },
                  { name: 'callData', type: 'bytes', internalType: 'bytes' },
                ],
              },
            ],
            outputs: [
              {
                name: 'returnData',
                type: 'tuple[]',
                internalType: 'struct Multicall.Result[]',
                components: [
                  { name: 'success', type: 'bool', internalType: 'bool' },
                  { name: 'returnData', type: 'bytes', internalType: 'bytes' },
                ],
              },
            ],
            stateMutability: 'payable',
          },
        ],
        address: ContractConfig[aura?.id ? aura?.id : 1235]
          ?.ASK1_1_MODULE_ADDRESS as `0x${string}`,
        functionName: `aggregate`,
        args: [calls],
      })
      .then((hash) => {
        publicClient
          .waitForTransactionReceipt({ hash })
          .then((res) => {
            if (res?.status === 'success') {
              setTimeout(() => {
                setBatchListStep(BatchListStep.Complete)
              }, 5000)
            }
          })
          .catch((error) => {
            setBatchListStep(BatchListStep.Approving)
            setTransactionError(error)
          })
      })
      .catch((err) => {
        setTransactionError(err)
        setBatchListStep(BatchListStep.Approving)
      })

    // wallet
    //   ?.writeContract({
    //     abi: [
    //       {
    //         inputs: [
    //           {
    //             internalType: 'address',
    //             name: '_tokenContract',
    //             type: 'address',
    //           },
    //           {
    //             internalType: 'uint256',
    //             name: '_tokenId',
    //             type: 'uint256',
    //           },
    //           {
    //             internalType: 'uint256',
    //             name: '_askPrice',
    //             type: 'uint256',
    //           },
    //           {
    //             internalType: 'address',
    //             name: '_askCurrency',
    //             type: 'address',
    //           },
    //           {
    //             internalType: 'address',
    //             name: '_sellerFundsRecipient',
    //             type: 'address',
    //           },
    //           {
    //             internalType: 'uint16',
    //             name: '_findersFeeBps',
    //             type: 'uint16',
    //           },
    //         ],
    //         name: 'createAsk',
    //         outputs: [],
    //         stateMutability: 'nonpayable',
    //         type: 'function',
    //       },
    //     ],
    //     address: ContractConfig[aura?.id ? aura?.id : 1235]
    //       ?.ASK1_1_MODULE_ADDRESS as `0x${string}`,
    //     functionName: 'createAsk',
    //     args: [
    //       contract as `0x${string}`,
    //       BigInt(Number(tokenId)),
    //       parseUnits(price, 18),
    //       zeroAddress,
    //       address as `0x${string}`,
    //       0,
    //     ],
    //     gas: 500000n,
    //   })
    //   .then((hash) => {
    //     publicClient
    //       .waitForTransactionReceipt({ hash })
    //       .then((res) => {
    //         if (res?.status === 'success') {
    //           setTimeout(() => {
    //             setBatchListStep(BatchListStep.Complete)
    //           }, 5000)
    //         }
    //       })
    //       .catch((error) => {
    //         setBatchListStep(BatchListStep.Approving)
    //         setTransactionError(error)
    //       })
    //   })
    //   .catch((err) => {
    //     setTransactionError(err)
    //     setBatchListStep(BatchListStep.Approving)
    //   })
  }

  const triggerApproveNft = (
    contract: `0x${string}`,
    tokenId: string,
    price: string
  ) => {
    setBatchListStep(BatchListStep.Approving)
    setStepData({
      totalSteps: 1,
      stepProgress: 1,
      currentStep: {
        kind: 'transaction',
        action: '',
        description:
          'Please approve the collection(s) from your wallet. Each collection only needs to be approved once.',
        id: '1',
      },
      listings: [],
    })
    // approve nft
    wallet
      ?.writeContract({
        abi: [
          {
            constant: false,
            inputs: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'bool', name: 'approved', type: 'bool' },
            ],
            name: 'setApprovalForAll',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        address: contract as `0x${string}`,
        functionName: 'setApprovalForAll',
        args: [
          ContractConfig[aura?.id ? aura?.id : 1235]
            ?.ERC721TRANSFERHELPER as `0x${string}`,
          true,
        ],
        gas: 500000n,
      })
      .then((hash) => {
        publicClient
          .waitForTransactionReceipt({ hash })
          .then(() => {
            triggerListTokenContract()
          })
          .catch((error) => {
            triggerListTokenContract()
            setTransactionError(error)
          })
      })
      .catch((err) => {
        setTransactionError(err)
        setBatchListStep(BatchListStep.Approving)
      })
  }

  useEffect(() => {
    if (stepData) {
      const orderKind = stepData.listings[0].listing.orderKind || 'exchange'

      switch (stepData.currentStep.kind) {
        case 'transaction': {
          setStepTitle(
            `Approve ${
              orderKind?.[0].toUpperCase() + orderKind?.slice(1)
            } to access item\nin your wallet`
          )
          break
        }
        case 'signature': {
          setStepTitle(`Confirm listings in your wallet`)
          break
        }
      }
    }
  }, [stepData])

  const listTokens = useCallback(async () => {
    if (!wallet) {
      const error = new Error('Missing a wallet')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setTransactionError(null)

    const batchListingData: BatchListingData[] = []

    listings.forEach((listing, i) => {
      let expirationTime: string | null = null

      if (
        listing.expirationOption &&
        listing.expirationOption.relativeTime &&
        listing.expirationOption.relativeTimeUnit
      ) {
        expirationTime = dayjs()
          .add(
            listing.expirationOption.relativeTime,
            listing.expirationOption.relativeTimeUnit
          )
          .unix()
          .toString()
      }

      const token = `${listing.token.token?.contract}:${listing.token.token?.tokenId}`

      const convertedListing: Listing = {
        token: token,
        currency: listing.currency.contract,
        weiPrice: (
          parseUnits(`${+listing.price}`, listing.currency.decimals || 18) *
          BigInt(listing.quantity)
        ).toString(),
        orderbook: listing.orderbook,
        orderKind: listing.orderKind,
        quantity: listing.quantity,
        fees: orderFees,
      }

      if (expirationTime) {
        convertedListing.expirationTime = expirationTime
      }

      batchListingData.push({
        listing: convertedListing,
        token: listing.token,
      })
    })

    setBatchListStep(BatchListStep.Approving)

    if (aura?.id) {
      if (!isApproveModule) {
        setBatchListStep(BatchListStep.Approving)
        setStepData({
          totalSteps: 1,
          stepProgress: 1,
          currentStep: {
            kind: 'transaction',
            action: 'approval',
            description:
              'You will be prompted to grant approval for selling on the marketplace. You only need to approve it once for the first time.',
            id: '1',
          },
          listings: batchListingData,
        })
        // approve module
        await wallet
          ?.writeContract({
            abi: [
              {
                inputs: [
                  {
                    internalType: 'address',
                    name: '_module',
                    type: 'address',
                  },
                  { internalType: 'bool', name: '_approved', type: 'bool' },
                ],
                name: 'setApprovalForModule',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function',
              },
            ],
            address: ContractConfig[aura?.id ? aura?.id : 1235]
              ?.ZORA_MODULE_MANAGER_ADDRESS as `0x${string}`,
            functionName: 'setApprovalForModule',
            args: [
              ContractConfig[aura?.id ? aura?.id : 1235]
                ?.ASK1_1_MODULE_ADDRESS as `0x${string}`,
              true,
            ],
            gas: 500000n,
          })
          .then((hash) => {
            publicClient
              .waitForTransactionReceipt({ hash })
              .then((res) => {
                // triggerApproveNft()
              })
              .catch((error) => {
                // triggerApproveNft()
                setTransactionError(error)
              })
          })
          .catch((err) => {
            setTransactionError(err)
            setBatchListStep(BatchListStep.Approving)
          })

        return
      }

      if (!isApproveNft) {
        // triggerApproveNft()
      } else {
        triggerListTokenContract()
      }
    } else {
      client.actions
        .listToken({
          listings: batchListingData.map((data) => data.listing),
          wallet,
          onProgress: (steps: Execute['steps']) => {
            const executableSteps = steps.filter(
              (step) => step.items && step.items.length > 0
            )

            let stepCount = executableSteps.length
            let incompleteStepItemIndex: number | null = null
            let incompleteStepIndex: number | null = null

            executableSteps.find((step, i) => {
              if (!step.items) {
                return false
              }

              incompleteStepItemIndex = step.items.findIndex(
                (item) => item.status == 'incomplete'
              )
              if (incompleteStepItemIndex !== -1) {
                incompleteStepIndex = i
                return true
              }
            })

            if (
              incompleteStepIndex === null ||
              incompleteStepItemIndex === null
            ) {
              const currentStep = executableSteps[executableSteps.length - 1]
              setBatchListStep(BatchListStep.Complete)
              setStepData({
                totalSteps: stepCount,
                stepProgress: stepCount,
                currentStep,
                listings: batchListingData,
              })
            } else {
              setStepData({
                totalSteps: stepCount,
                stepProgress: incompleteStepIndex,
                currentStep: executableSteps[incompleteStepIndex],
                listings: batchListingData,
              })
            }
          },
        })
        .catch((e: any) => {
          const error = e as Error
          const transactionError = new Error(
            'Oops, something went wrong. Please try again.',
            {
              cause: error,
            }
          )
          setTransactionError(transactionError)
        })
    }
  }, [client, listings, wallet])

  const trigger = (
    <Button disabled={disabled} onClick={listTokens}>
      List
    </Button>
  )
  if (isInTheWrongNetwork) {
    return (
      <Button
        disabled={disabled}
        onClick={async () => {
          if (isInTheWrongNetwork && switchChainAsync) {
            const chain = await switchChainAsync({
              chainId: marketplaceChain.id,
            })
            if (chain.id !== marketplaceChain.id) {
              return false
            }
          }

          if (!wallet) {
            openConnectModal?.()
          }
        }}
      >
        List
      </Button>
    )
  }
  return (
    <Modal
      title="Complete Listings"
      trigger={trigger}
      open={open}
      onOpenChange={(open) => {
        if (
          !open &&
          onCloseComplete &&
          batchListStep === BatchListStep.Complete
        ) {
          onCloseComplete()
        }
        setOpen(open)
      }}
    >
      {batchListStep === BatchListStep.Approving && (
        <Flex
          direction="column"
          justify="start"
          align="center"
          css={{ flex: 1, textAlign: 'center', p: '$4', gap: '$4' }}
        >
          {transactionError && (
            <ErrorWell
              message={transactionError.message}
              css={{ width: '100%' }}
            />
          )}
          {!stepData && !transactionError && (
            <Flex css={{ height: '100%', py: '$6' }} align="center">
              <LoadingSpinner />
            </Flex>
          )}
          {stepData && (
            <Flex
              direction="column"
              align="center"
              css={{ maxHeight: '40vh', overflowY: 'auto', width: '100%' }}
            >
              {stepData.currentStep.kind === 'signature' ? (
                <Text
                  css={{
                    textAlign: 'center',
                    my: 28,
                    maxWidth: 400,
                  }}
                  style="subtitle1"
                >
                  {stepTitle}
                </Text>
              ) : null}
              <Flex direction="column" css={{ gap: '$3', width: '100%' }}>
                {stepData.currentStep.kind === 'transaction'
                  ? stepData.currentStep.items?.map((item, i) => {
                      if (item.data)
                        return (
                          <ApprovalCollapsible
                            key={i}
                            item={item}
                            batchListingData={stepData.listings}
                            open={item.status == 'incomplete'}
                          />
                        )
                    })
                  : null}
              </Flex>
              {stepData.currentStep.kind === 'signature' ? (
                <TransactionProgress
                  justify="center"
                  css={{ mb: '$3' }}
                  fromImgs={stepData.listings.map(
                    (listing) => listing.token.token?.imageSmall as string
                  )}
                  toImgs={uniqueMarketplaces.map((marketplace) => {
                    return marketplace?.imageUrl || ''
                  })}
                />
              ) : null}
            </Flex>
          )}

          <Text
            css={{
              textAlign: 'center',
              maxWidth: 395,
              mx: 'auto',
            }}
            style="body3"
            color="subtle"
          >
            {stepData?.currentStep.description}
          </Text>

          {!transactionError ? (
            <Button
              css={{ width: '100%', justifyContent: 'center' }}
              disabled={true}
            >
              Waiting for Approval...
            </Button>
          ) : (
            <Button
              css={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          )}
        </Flex>
      )}
      {batchListStep === BatchListStep.Complete && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          css={{ flex: 1, textAlign: 'center', p: '$4' }}
        >
          <Flex direction="column" css={{ my: 50 }}>
            <Box css={{ color: '$green10', mb: 24 }}>
              <FontAwesomeIcon icon={faCheckCircle} size="2x" />
            </Box>
            <Text style="h5">Your items have been listed!</Text>
          </Flex>
          <Button
            css={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              setOpen(false)
              onCloseComplete?.()
            }}
          >
            Close
          </Button>
        </Flex>
      )}
    </Modal>
  )
}

export default BatchListModal
