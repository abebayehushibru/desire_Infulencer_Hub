import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './pages/auth/Login'
import DashboardLayout from './layouts/DashboardLayout'
import AppRouter from './router/AppRouter'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  const [count, setCount] = useState(0)
  return (
    <AuthProvider>
      <div className='poppins'>
        {/* <Login/> */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
        />
        <AppRouter />
      </div>
    </AuthProvider>

  )
}

export default App
