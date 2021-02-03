import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'

import { Provider, createClient } from 'urql';
const client = createClient({ url: 'https://localhost:400/graphql',
  fetchOptions: {
    credentials: 'include',
  }
})

import theme from '../theme'

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>

    </Provider>
  )
}

export default MyApp
