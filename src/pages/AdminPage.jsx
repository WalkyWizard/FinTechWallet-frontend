import { useEffect, useState } from 'react'
import Header from '../components/Header'
import TransactionModal from '../components/TransactionModal'
import {
  getAdminTransactions,
  getAdminUsers,
  getAdminUserWallets,
  getAuth,
  setUserBlocked,
} from '../services/api'
import './WalletPage.css'

const filterOptions = [
  { id: 'all', label: 'Всі транзакції' },
  { id: 'deposit', label: 'Поповнення' },
  { id: 'withdraw', label: 'Виведення' },
  { id: 'transfer', label: 'Перекази' },
]

function AdminPage() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedUserFilter, setSelectedUserFilter] = useState('')
  const [userWallets, setUserWallets] = useState([])
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('')
  const [tranTypeFilter, setTranTypeFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async (type = tranTypeFilter, userId = selectedUserFilter, showLoader = false) => {
    try {
      if (showLoader) setLoading(true)
      const [userData, transactionData] = await Promise.all([
        getAdminUsers(),
        getAdminTransactions(type, userId || null),
      ])
      setUsers(userData)
      setTransactions(transactionData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

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
    loadData(tranTypeFilter, selectedUserFilter, false)
  }, [tranTypeFilter, selectedUserFilter])

  useEffect(() => {
    if (!selectedUserFilter) {
      setUserWallets([])
      setSelectedWalletFilter('')
      return
    }

    getAdminUserWallets(selectedUserFilter)
      .then((data) => {
        if (Array.isArray(data)) {
          setUserWallets(data)
        } else {
          setUserWallets([])
        }
      })
      .catch(() => {
        setUserWallets([])
      })
    setSelectedWalletFilter('')
  }, [selectedUserFilter])

  const toggleUser = async (user) => {
    try {
      const willBlock = user.status !== 'blocked'
      await setUserBlocked(user.id, willBlock)
      setUsers(
        users.map((item) =>
          item.id === user.id
            ? { ...item, status: willBlock ? 'blocked' : 'active' }
            : item
        )
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const displayedTransactions = transactions.filter((tx) => {
    if (!selectedWalletFilter) return true
    return tx.sender === selectedWalletFilter || tx.receiver === selectedWalletFilter
  })

  return (
    <main className="site-shell wallet-shell">
      <Header page="admin" />
      <section className="wallets-section container">
        <div className="page-heading">
          <div>
            <p className="page-kicker">Адміністрування платформи</p>
            <h1>Панель адміністратора</h1>
            <p>Управління користувачами, перегляд фінансових потоків та моніторинг операцій.</p>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <section className="admin-section" aria-labelledby="users-heading">
          <div className="section-heading">
            <div>
              <p className="page-kicker">Облікові записи</p>
              <h2 id="users-heading">Користувачі системи ({users.length})</h2>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ім’я клієнта</th>
                  <th>Електронна пошта</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Дата реєстрації</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Адміністратор' : 'Клієнт'}
                      </span>
                    </td>
                    <td>
                      <span className={`table-badge ${user.status}`}>
                        {user.status === 'blocked' ? 'Заблоковано' : 'Активний'}
                      </span>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td>
                      <button
                        className={`text-button ${user.status === 'blocked' ? 'success-button' : 'danger-button'}`}
                        type="button"
                        onClick={() => toggleUser(user)}
                      >
                        {user.status === 'blocked' ? 'Розблокувати' : 'Заблокувати'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section transactions" aria-labelledby="admin-tx-heading">
          <div className="section-heading">
            <div>
              <p className="page-kicker">Фінансовий моніторинг</p>
              <h2 id="admin-tx-heading">Всі транзакції системи ({displayedTransactions.length})</h2>
            </div>

            <div className="filter-buttons">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`filter-btn ${tranTypeFilter === opt.id ? 'active' : ''}`}
                  onClick={() => setTranTypeFilter(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-secondary-filters">
            <div className="admin-select-wrapper">
              <label className="admin-filter-label">Клієнт:</label>
              <select
                aria-label="Фільтр за користувачем"
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="admin-select"
              >
                <option value="">Всі користувачі</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} - {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUserFilter && (
              <div className="admin-select-wrapper">
                <label className="admin-filter-label">Гаманець:</label>
                <select
                  aria-label="Фільтр за гаманцем"
                  value={selectedWalletFilter}
                  onChange={(e) => setSelectedWalletFilter(e.target.value)}
                  className="admin-select"
                >
                  <option value="">Всі гаманці ({userWallets.length})</option>
                  {userWallets.map((w) => (
                    <option key={w.id} value={w.wallet_address}>
                      {w.name} ({w.wallet_address})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="transaction-empty">
              <span>◎</span>
              <p>Завантаження транзакцій...</p>
            </div>
          ) : displayedTransactions.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип операції</th>
                    <th>Відправник</th>
                    <th>Отримувач</th>
                    <th>Сума</th>
                    <th>Комісія сервісу</th>
                    <th>Статус</th>
                    <th>Дата та час</th>
                    <th>Деталі</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTransactions.map((tx) => {
                    const numVal = Number(tx.amount || 0)
                    const isDep = tx.type === 'deposit'
                    const feeRate = isDep ? 0 : 0.02
                    const feeAmount = numVal * feeRate

                    return (
                      <tr
                        key={tx.id}
                        className="table-row-clickable"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <td>#{tx.id}</td>
                        <td>
                          <span className={`type-tag ${tx.type}`}>
                            {tx.type === 'deposit'
                              ? 'Поповнення'
                              : tx.type === 'withdraw'
                              ? 'Виведення'
                              : 'Переказ'}
                          </span>
                        </td>
                        <td className="table-address-cell">{tx.sender || '—'}</td>
                        <td className="table-address-cell">{tx.receiver || '—'}</td>
                        <td>
                          <strong className="table-amount">
                            {numVal.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} UAH
                          </strong>
                        </td>
                        <td>
                          <span className="table-fee">
                            {isDep ? '0%' : `2% (${feeAmount.toFixed(2)} UAH)`}
                          </span>
                        </td>
                        <td>
                          <span className={`table-badge ${tx.status}`}>
                            {tx.status === 'completed'
                              ? 'Виконано'
                              : tx.status === 'pending'
                              ? 'Очікує'
                              : 'Відхилено'}
                          </span>
                        </td>
                        <td>
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleString('uk-UA', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td>
                          <button
                            className="table-detail-link"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTransaction(tx)
                            }}
                          >
                            Деталі
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="transaction-empty">
              <span>◎</span>
              <p>Транзакцій за обраними критеріями не знайдено</p>
              <small>Спробуйте змінити фільтр за типом або обрати інший гаманець/користувача.</small>
            </div>
          )}
        </section>
      </section>

      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </main>
  )
}

export default AdminPage
