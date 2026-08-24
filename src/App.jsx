import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function getRoute() {
  const route = window.location.hash.replace('#', '')
  return ['login', 'register'].includes(route) ? route : 'home'
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
  return <HomePage />
}

export default App
