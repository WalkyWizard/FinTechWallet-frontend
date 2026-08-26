import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WalletPage from './pages/WalletPage'
import WalletsPage from './pages/WalletsPage'
import CreateWalletPage from './pages/CreateWalletPage'
import AdminPage from './pages/AdminPage'

function getRoute() {
  const route = window.location.hash.replace('#', '').split('/')[0]
  return ['login', 'register', 'wallets', 'wallet', 'create-wallet', 'admin'].includes(route)
    ? route
    : 'home'
}

function App() {
  const [page, setPage] = useState(getRoute)

  useEffect(() => {
    const onHashChange = () => setPage(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (page === 'login') return <LoginPage />
  if (page === 'register') return <RegisterPage />
  if (page === 'wallets') return <WalletsPage />
  if (page === 'wallet') return <WalletPage />
  if (page === 'create-wallet') return <CreateWalletPage />
  if (page === 'admin') return <AdminPage />
  return <HomePage />
}

export default App
