import { Box } from 'components/primitives'
import { FC, ReactNode } from 'react'
import Navbar from './navbar'
import UnsupportedChainBanner from './UnsupportedChainBanner'
import { Footer } from './home/Footer'

type Props = {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Box
        css={{
          background: '$neutralBg',
          height: '100%',
          minHeight: '100vh',
          pt: 80,
        }}
      >
        <Box css={{ maxWidth: 4500, mx: 'auto' }}>
          <Navbar />
          <UnsupportedChainBanner />
          <main>{children}</main>
          <Footer />
        </Box>
      </Box>
    </>
  )
}

export default Layout
