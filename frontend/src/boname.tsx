import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CustomProvider } from 'rsuite'
import App from './App'
import 'rsuite/dist/rsuite.css'
import './styles/theme.css'
import './styles/rsuite-overrides.css'
import './styles/components.css'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const showQueryDevtools = import.meta.env.DEV && import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomProvider theme="light">
      <QueryClientProvider client={queryClient}>
        <App />
        {showQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </CustomProvider>
  </StrictMode>,
)
