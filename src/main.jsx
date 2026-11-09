import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { BouquetProvider } from './context/BouquetContext'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BouquetProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </BouquetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)