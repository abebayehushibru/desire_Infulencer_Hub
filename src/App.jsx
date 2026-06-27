import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className='poppins'>
      {/* <Login/> */}
      <DashboardLayout></DashboardLayout>
    </div>
  )
}

export default App
