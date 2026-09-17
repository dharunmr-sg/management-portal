import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ui/ToastContainer'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <App />
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
