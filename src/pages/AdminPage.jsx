import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { getAdminTransactions, getAdminUsers, getAuth, setUserBlocked } from '../services/api'
import './WalletPage.css'

function AdminPage() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = getAuth()
    if (!auth?.access_token) {
      window.location.hash = 'login'
      return
    }
    if (auth.role !== 'admin') {
      window.location.hash = 'wallets'
      return
    }
    Promise.all([getAdminUsers(), getAdminTransactions()])
      .then(([userData, transactionData]) => { setUsers(userData); setTransactions(transactionData) })
      .catch((requestError) => setError(requestError.message))
  }, [])

  const toggleUser = async (user) => {
    try {
      await setUserBlocked(user.id, user.status !== 'blocked')
      setUsers(users.map((item) => item.id === user.id
        ? { ...item, status: item.status === 'blocked' ? 'active' : 'blocked' }
        : item))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="site-shell wallet-shell">
      <Header page="admin" />
      <section className="wallets-section container">
        <div className="page-heading"><div><p className="page-kicker">Керування</p><h1>Адмін-панель</h1><p>Користувачі та всі транзакції системи.</p></div></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <section className="admin-section"><h2>Користувачі</h2>
          <div className="transaction-list">{users.map((user) => <div className="transaction-row" key={user.id}><span><strong>{user.name}</strong><small>{user.email}</small></span><small>{user.status}</small><button className="text-button" type="button" onClick={() => toggleUser(user)}>{user.status === 'blocked' ? 'Розблокувати' : 'Заблокувати'}</button></div>)}</div>
        </section>
        <section className="admin-section"><h2>Транзакції</h2>
          <div className="transaction-list">{transactions.map((transaction) => <div className="transaction-row" key={transaction.id}><span>{transaction.type}</span><b>{transaction.amount} UAH</b><small>{transaction.status}</small></div>)}</div>
        </section>
      </section>
    </main>
  )
}

export default AdminPage
