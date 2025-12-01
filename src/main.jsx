import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";   // <-- ADD THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
