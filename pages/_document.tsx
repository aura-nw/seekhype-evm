import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import { getCssText } from '../stitches.config'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
        </Head>

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Enhance your seamless NFT experience while enjoying utility with premier Web2 brands"
        />

        {/* Meta tags */}
        <meta name="keywords" content="nft, ethereum, protocol" />
        <meta name="keywords" content="NFT, API, Protocol" />

        {/* Favicon */}
        <link
          rel="shortcut icon"
          type="image/svg"
          href="https://beta.seekhype.io/assets/imgs/seekhype.png"
        />

        {/* Reservoir meta tags */}
        <meta
          property="reservoir:title"
          content="The simplest NFT Marketplace"
        />
        <meta
          property="reservoir:icon"
          content="https://beta.seekhype.io/assets/imgs/seekhype.png"
        />

        {/* Google / Search Engine Tags */}
        <meta itemProp="name" content="SeekHYPE" />
        <meta
          itemProp="description"
          content="Enhance your seamless NFT experience while enjoying utility with premier Web2 brands"
        />
        <meta
          itemProp="image"
          content="https://beta.seekhype.io/assets/imgs/seekhype.png"
        />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://beta.seekhype.io" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The simplest NFT Marketplace" />
        <meta
          property="og:description"
          content="Enhance your seamless NFT experience while enjoying utility with premier Web2 brands"
        />
        <meta
          property="og:image"
          content="https://beta.seekhype.io/assets/imgs/seekhype.png"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The simplest NFT Marketplace" />
        <meta
          name="twitter:description"
          content="Enhance your seamless NFT experience while enjoying utility with premier Web2 brands"
        />
        <meta
          name="twitter:image"
          content="https://beta.seekhype.io/assets/imgs/seekhype.png"
        />
        {/* <meta
          property="reservoir:token-url-mainnet"
          content="/ethereum/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-goerli"
          content="/goerli/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-polygon"
          content="/polygon/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-arbitrum"
          content="/arbitrum/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-optimism"
          content="/optimism/asset/${contract}:${tokenId}"
        />
        <meta
          property="reservoir:token-url-zora"
          content="/zora/asset/${contract}:${tokenId}"
        /> */}
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
