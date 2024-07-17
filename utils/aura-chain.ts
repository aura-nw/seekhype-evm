import { defineChain, zeroAddress } from 'viem'

// export const aura = /*#__PURE__*/ defineChain({
//   id: 1235,
//   name: 'Aura EVM',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'aura',
//     symbol: 'aura',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://jsonrpc.dev.aura.network/'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Aura EVM Block Explorer',
//       url: 'https://explorer.dev.aura.network',
//     },
//   },
//   paymentTokens: [
//     {
//       chainId: 1235,
//       address: zeroAddress,
//       symbol: 'aura',
//       name: 'aura',
//       decimals: 18,
//     },
//   ],
// })

export const aura = /*#__PURE__*/ defineChain({
  id: 1236,
  name: 'Aura EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'aura',
    symbol: 'aura',
  },
  rpcUrls: {
    default: {
      http: ['https://jsonrpc.serenity.aura.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Aura EVM Block Explorer',
      url: 'https://serenity.aurascan.io',
    },
  },
  paymentTokens: [
    {
      chainId: 1236,
      address: zeroAddress,
      symbol: 'aura',
      name: 'aura',
      decimals: 18,
    },
  ],
})

// export const aura = /*#__PURE__*/ defineChain({
//   id: 6321,
//   name: 'Aura EVM',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'aura',
//     symbol: 'aura',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://jsonrpc.euphoria.aura.network/'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Aura EVM Block Explorer',
//       url: 'https://euphoria.aurascan.io',
//     },
//   },
//   paymentTokens: [
//     {
//       chainId: 6321,
//       address: zeroAddress,
//       symbol: 'aura',
//       name: 'aura',
//       decimals: 18,
//     },
//   ],
// })
// export const aura = /*#__PURE__*/ defineChain({
//   id: 6322,
//   name: 'Aura EVM',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'aura',
//     symbol: 'aura',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://jsonrpc.aura.network/'],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Aura EVM Block Explorer',
//       url: 'https://aurascan.io',
//     },
//   },
//   paymentTokens: [
//     {
//       chainId: 6322,
//       address: zeroAddress,
//       symbol: 'aura',
//       name: 'aura',
//       decimals: 18,
//     },
//   ],
// })
