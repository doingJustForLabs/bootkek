import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContext } from './http/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContext>
      <App />
    </AuthContext>
  </StrictMode>,
)
