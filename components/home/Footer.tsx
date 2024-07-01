import { FC, useEffect, useMemo } from 'react'
import { Text, Box, Flex, Anchor, Button, Input } from '../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useMarketplaceChain, useMounted } from 'hooks'
import { useTheme } from 'next-themes'
import { useMediaQuery } from 'react-responsive'

type SectionTitleProps = {
  title: string
}

const SectionTitle: FC<SectionTitleProps> = ({ title }) => (
  <Text style="subtitle1" css={{ color: '$gray12', mb: 8 }}>
    {title}
  </Text>
)

type SectionLinkProps = {
  name: string
  href: string
}

const SectionLink: FC<SectionLinkProps> = ({ name, href }) => (
  <Anchor
    target="_blank"
    rel="noopener noreferrer"
    href={href}
    weight="medium"
    css={{ fontSize: 14, mt: 16 }}
  >
    {name}
  </Anchor>
)

const developerSectionLinks = [
  {
    name: 'Request a Feature',
    href: 'https://airtable.com/shrRf1uRhDJT9DNcR',
  },
  {
    name: 'Apply for Launchpad',
    href: 'https://airtable.com/shri8ESCJM3Y8Z4Tf',
  },
  {
    name: 'Apply for Grants',
    href: 'https://airtable.com/shrcQ3bJm3i4DblbC',
  },
]

const resourceSectionLinks = [
  {
    name: 'Learn',
    href: 'https://blog.seekhype.io/',
  },
  {
    name: 'Help Center',
    href: 'https://seekhype-advanced-nft-marketplace.notion.site/SeekHYPE-Help-Center-67f29db2cf9e44cc9797204cce691bbe',
  },
  {
    name: 'Ambassador',
    href: 'https://blog.seekhype.io/join-the-seekhype-ambassador-empower-engage-elevate/',
  },
  {
    name: 'Instant Support',
    href: 'https://discord.com/invite/seekhype',
  },
]

const companySectionLinks = [
  {
    name: 'About',
    href: 'http://bit.ly/3Jx5Wwj',
  },
  {
    name: 'Hiring: Join Us!',
    href: 'https://www.linkedin.com/company/seekhype-advanced-nft-marketplace/',
  },
]

const MAIL_CHIP = 'https://seekhype.us14.list-manage.com/subscribe/post'

export const Footer = () => {
  const isMounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 }) && isMounted
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [logoSrc, setLogoSrc] = useState(
    'sh-evm-logo.svg'
  )
  const { routePrefix } = useMarketplaceChain()
  const params = useMemo(() => new URLSearchParams(), [])

  useEffect(() => {
    setLogoSrc(
      theme === 'dark'
        ? '/sh-evm-logo-white.svg'
        : '/sh-evm-logo.svg'
    )
  }, [theme])

  const subscribeEmail = () => {
    params.set('u', '77385ab0433b65493e7af55a6')
    params.set('id', '5c6e15103a')
    params.set('EMAIL', email)
    params.set('b_77385ab0433b65493e7af55a6_5c6e15103a', '')
    const mailChimpUrl = `${MAIL_CHIP}?${params.toString()}`

    window.open(mailChimpUrl, '_blank')
  }

  return (
    <Flex
      css={{
        flexDirection: 'column',
        gap: 20,
        borderTop: '1px solid $gray7',
        borderStyle: 'solid',
      }}
    >
      <Flex
        css={{
          px: '$5',
          py: '$5',
          '@lg': {
            px: '$6',
            py: '$6',
          },
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Link href={`/${routePrefix}`} style={{ width: '124' }}>
          <Image src={logoSrc} width={124} height={48} alt="SeekHypeEVM" />
        </Link>
        <Text style="body2" css={{ display: 'block', color: '#161618' }}>
          Enhance your seamless NFT experience while enjoying utility with
          premier Web2 brands
        </Text>
        <Flex
          justify="between"
          css={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 36,
            '@bp600': {
              flexDirection: 'row',
              gap: 0,
            },
          }}
        >
          <Flex css={{ gap: 80, '@bp600': { gap: 136 }, flexWrap: 'wrap' }}>
            <Flex direction="column">
              <SectionTitle title="Marketplace" />
              {developerSectionLinks.map((props) => (
                <SectionLink key={props.name} {...props} />
              ))}
            </Flex>
            <Flex direction="column">
              <SectionTitle title="Resources" />
              {resourceSectionLinks.map((props) => (
                <SectionLink key={props.name} {...props} />
              ))}
            </Flex>
            <Flex direction="column">
              <SectionTitle title="Company" />
              {companySectionLinks.map((props) => (
                <SectionLink key={props.name} {...props} />
              ))}
            </Flex>
          </Flex>
          <Flex
            direction="column"
            css={{
              alignItems: 'flex-start',
            }}
          >
            <SectionTitle title="Join the Mailing List" />
            <Flex css={{ gap: 12, mt: 16 }}>
              <Input
                placeholder="Your email address"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={subscribeEmail}>Subscribe</Button>
            </Flex>
            <Flex css={{ gap: 12, mt: 16 }}>
              <Link href={'https://twitter.com/SeekHYPEHQ'} target="blank">
                <Button color="gray3" size="xs">
                  <Box>
                    <FontAwesomeIcon icon={faTwitter} width={16} height={16} />
                  </Box>
                </Button>
              </Link>
              <Link href={'https://discord.com/invite/seekhype'} target="blank">
                <Button color="gray3" size="xs">
                  <Box>
                    <FontAwesomeIcon icon={faDiscord} width={16} height={16} />
                  </Box>
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        justify={!isMobile ? 'between' : 'center'}
        css={{
          borderTop: '1px solid $gray7',
          borderStyle: 'solid',
          px: !isMobile ? '$6' : '$4',
          py: '$5',
          gap: '12px',
        }}
        wrap={'wrap'}
      >
        <Text
          style="body2"
          css={{
            color: '#706d77',
          }}
        >
          © 2023 SeekHYPE. The Simplest NFT Marketplace
        </Text>
        <Flex align={'center'} css={{ gap: 20 }}>
          <Link href={`/${routePrefix}/terms-of-service`}>
            <Text
              style="body2"
              css={{
                color: '#706d77',
              }}
            >
              Term of Service
            </Text>
          </Link>
          <Link href={`/${routePrefix}/privacy-policy`}>
            <Text
              style="body2"
              css={{
                color: '#706d77',
              }}
            >
              Privacy Policy
            </Text>
          </Link>
        </Flex>
      </Flex>
    </Flex>
  )
}
