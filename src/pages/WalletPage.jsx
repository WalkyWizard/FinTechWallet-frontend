import { useCallback, useEffect, useState } from 'react'
import Header from '../components/Header'
import TransactionModal from '../components/TransactionModal'
import {
  acceptTransfer,
  deposit,
  getAuth,
  getHistory,
  getPendingTransfers,
  getWallet,
  rejectTransfer,
  transfer,
  withdraw,
} from '../services/api'
import './WalletPage.css'

const actions = [
  ['Поповнити баланс', 'Зарахувати кошти без комісії (0%)', 'deposit'],
  ['Вивести кошти', 'Виведення коштів на картку (2% комісія)', 'withdraw'],
  ['Переказати', 'Переказ коштів користувачу (2% комісія)', 'transfer'],
]

const filterOptions = [
  { id: 'all', label: 'Всі операції' },
  { id: 'deposit', label: 'Поповнення' },
  { id: 'withdraw', label: 'Виведення' },
  { id: 'transfer', label: 'Перекази' },
]

function WalletPage() {
  const walletId = Number(window.location.hash.split('/')[1])
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [error, setError] = useState('')
  const [operation, setOperation] = useState('')
  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const reloadData = useCallback(async (currentFilter = filterType) => {
    try {
      const [walletData, history, pending] = await Promise.all([
        getWallet(walletId),
        getHistory(walletId, currentFilter),
        getPendingTransfers(walletId),
      ])
      setWallet(walletData)
      setTransactions(Array.isArray(history) ? history : [])
      setPendingTransfers(Array.isArray(pending) ? pending : [])
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [walletId, filterType])

  useEffect(() => {
    if (!getAuth()?.access_token) {
      window.location.hash = 'login'
      return
    }
    reloadData(filterType)
  }, [reloadData, filterType])

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter)
  }

  const handleOperationSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Введіть коректну суму більше 0')
      setIsSubmitting(false)
      return
    }

    try {
      if (operation === 'transfer') {
        if (!receiver.trim()) {
          setError('Вкажіть номер гаманця отримувача')
          setIsSubmitting(false)
          return
        }
        await transfer(walletId, receiver, parsedAmount)
      } else if (operation === 'deposit') {
        await deposit(walletId, parsedAmount)
      } else if (operation === 'withdraw') {
        await withdraw(walletId, parsedAmount)
      }

      await reloadData(filterType)
      setAmount('')
      setReceiver('')
      setOperation('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptTransfer = async (transactionId) => {
    try {
      await acceptTransfer(transactionId)
      await reloadData(filterType)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleRejectTransfer = async (transactionId) => {
    try {
      await rejectTransfer(transactionId)
      await reloadData(filterType)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleCopyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard?.writeText(wallet.wallet_address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const numAmount = parseFloat(amount) || 0
  const feeRate = operation === 'deposit' ? 0 : 0.02
  const calculatedFee = numAmount * feeRate
  const totalDebit = operation === 'deposit' ? numAmount : numAmount + calculatedFee

  return (
    <main className="site-shell wallet-shell">
      <Header page="wallet" />
      <section className="wallet-section container">
        <div className="wallet-top-nav">
          <a className="back-link" href="#wallets">
            ← Повернутися до всіх гаманців
          </a>
        </div>

        <div className="wallet-title-row">
          <div>
            <p className="page-kicker">Керування гаманцем</p>
            <h1>{wallet?.name || 'Гаманець'}</h1>
            {wallet?.wallet_address && (
              <div className="wallet-address-bar">
                <span>Номер гаманця: <strong>{wallet.wallet_address}</strong></span>
                <button className="copy-badge-btn" type="button" onClick={handleCopyAddress}>
                  {copiedAddress ? 'Скопійовано ✓' : 'Копіювати'}
                </button>
              </div>
            )}
          </div>
          <span className="status-badge"><i /> Активний</span>
        </div>

        <div className="balance-panel">
          <p>Поточний доступний баланс</p>
          <strong>
            {Number(wallet?.balance || 0).toLocaleString('uk-UA', { minimumFractionDigits: 2 })}
            <small> UAH</small>
          </strong>
          <span>Оновлено в режимі реального часу</span>
        </div>

        <div className="action-grid">
          {actions.map(([title, description, actionType]) => (
            <button
              className={`action-card ${operation === actionType ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setOperation(operation === actionType ? '' : actionType)
                setError('')
                setSuccessMessage('')
              }}
              key={title}
            >
              <span className="action-arrow">↗</span>
              <strong>{title}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>

        {operation && (
          <form className="operation-form" onSubmit={handleOperationSubmit}>
            <div className="operation-form-header">
              <h3>
                {operation === 'deposit'
                  ? 'Поповнення балансу (Комісія 0%)'
                  : operation === 'withdraw'
                  ? 'Виведення коштів на картку (Комісія 2%)'
                  : 'Переказ коштів іншому користувачу (Комісія 2%)'}
              </h3>
              <p className="operation-hint">
                {operation === 'deposit'
                  ? 'Введіть суму, яку бажаєте зарахувати на гаманець.'
                  : operation === 'withdraw'
                  ? 'Введіть суму виведення. З балансу буде списано суму з урахуванням 2% комісії.'
                  : 'Введіть номер гаманця отримувача (16 цифр) та суму переказу.'}
              </p>
            </div>

            <div className="operation-inputs">
              {operation === 'transfer' && (
                <div className="operation-field">
                  <label htmlFor="receiver-input">Номер гаманця отримувача (16 цифр)</label>
                  <input
                    id="receiver-input"
                    type="text"
                    value={receiver}
                    maxLength="16"
                    onChange={(event) => setReceiver(event.target.value.replace(/\D/g, ''))}
                    placeholder="Наприклад: 1234567812345678"
                    required
                  />
                </div>
              )}

              <div className="operation-field">
                <label htmlFor="amount-input">Сума операції (UAH)</label>
                <input
                  id="amount-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {numAmount > 0 && (
              <div className="operation-fee-preview">
                <div className="fee-preview-item">
                  <span>Сума операції:</span>
                  <strong>{numAmount.toFixed(2)} UAH</strong>
                </div>
                <div className="fee-preview-item">
                  <span>Комісія сервісу ({operation === 'deposit' ? '0%' : '2%'}):</span>
                  <strong className="fee-val">{calculatedFee.toFixed(2)} UAH</strong>
                </div>
                <div className="fee-preview-item total">
                  <span>
                    {operation === 'deposit'
                      ? 'Разом до зарахування:'
                      : 'Разом буде списано з балансу:'}
                  </span>
                  <strong>{totalDebit.toFixed(2)} UAH</strong>
                </div>
              </div>
            )}

            <div className="operation-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Виконується операція...' : 'Підтвердити операцію'}
              </button>
              <button
                className="text-button cancel-btn"
                type="button"
                onClick={() => {
                  setOperation('')
                  setAmount('')
                  setReceiver('')
                }}
              >
                Скасувати
              </button>
            </div>
          </form>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        {pendingTransfers.length > 0 && (
          <section className="pending-transfers" aria-labelledby="pending-title">
            <div className="section-heading">
              <div>
                <p className="page-kicker">Очікують підтвердження</p>
                <h2 id="pending-title">Вхідні перекази</h2>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Сума переказу</th>
                    <th>Гаманець відправника</th>
                    <th>Статус</th>
                    <th>Дата надходження</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransfers.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>#{transaction.id}</td>
                      <td>
                        <strong className="table-amount">{transaction.amount} UAH</strong>
                      </td>
                      <td>{transaction.sender || '—'}</td>
                      <td>
                        <span className="table-badge pending">Очікує</span>
                      </td>
                      <td>
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleString('uk-UA')
                          : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button button-small table-btn-accept"
                            type="button"
                            onClick={() => handleAcceptTransfer(transaction.id)}
                          >
                            Прийняти
                          </button>
                          <button
                            className="text-button danger-button"
                            type="button"
                            onClick={() => handleRejectTransfer(transaction.id)}
                          >
                            Відхилити
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="transactions" aria-labelledby="transactions-title">
          <div className="section-heading">
            <div>
              <p className="page-kicker">Історія фінансових операцій</p>
              <h2 id="transactions-title">Транзакції гаманця</h2>
            </div>
            <div className="filter-buttons">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`filter-btn ${filterType === opt.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип операції</th>
                    <th>Контрагент / Номер</th>
                    <th>Сума</th>
                    <th>Комісія</th>
                    <th>Статус</th>
                    <th>Дата та час</th>
                    <th>Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const numVal = Number(tx.amount || 0)
                    const isDep = tx.type === 'deposit'
                    const feeRateVal = isDep ? 0 : 0.02
                    const feeVal = numVal * feeRateVal
                    const counterparty =
                      tx.type === 'deposit'
                        ? tx.receiver || 'Поповнення'
                        : tx.type === 'withdraw'
                        ? tx.sender || 'Виведення'
                        : tx.sender && tx.receiver
                        ? `${tx.sender} → ${tx.receiver}`
                        : tx.sender || tx.receiver || '—'

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
                        <td className="table-address-cell">{counterparty}</td>
                        <td>
                          <strong className="table-amount">
                            {numVal.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} UAH
                          </strong>
                        </td>
                        <td>
                          <span className="table-fee">
                            {isDep ? '0%' : `2% (${feeVal.toFixed(2)} UAH)`}
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
              <p>Транзакцій за обраним фільтром не знайдено</p>
              <small>Тут з’являться всі операції з цим гаманцем.</small>
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

export default WalletPage