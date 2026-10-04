import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MilaapProvider } from './context/AppContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* Future flags silence React Router's v7 deprecation warnings. */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MilaapProvider>
          <App />
        </MilaapProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
