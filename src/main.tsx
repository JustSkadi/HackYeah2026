import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './lib/data'
import { PhoneCallProvider } from './components/PhoneCall'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <PhoneCallProvider>
          <App />
        </PhoneCallProvider>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
)
