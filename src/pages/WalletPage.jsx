import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { acceptTransfer, deposit, getAuth, getHistory, getPendingTransfers, getWallet, rejectTransfer, transfer, withdraw } from '../services/api'
import './WalletPage.css'

const actions = [
  ['Поповнити баланс', 'Зарахувати кошти на гаманець', '#deposit'],
  ['Вивести кошти', 'Перевести кошти на картку', '#withdraw'],
  ['Переказати', 'Надіслати гроші іншому користувачу', '#transfer'],
]

function WalletPage() {
  const walletId = Number(window.location.hash.split('/')[1])
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [error, setError] = useState('')
  const [operation, setOperation] = useState('')
  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!getAuth()?.access_token) { window.location.hash = 'login'; return }
    Promise.all([getWallet(walletId), getHistory(walletId), getPendingTransfers()])
      .then(([walletData, history, pending]) => { setWallet(walletData); setTransactions(history); setPendingTransfers(pending) })
      .catch((requestError) => setError(requestError.message))
  }, [walletId])

  return (
    <main className="site-shell wallet-shell">
      <Header page="wallet" />
      <section className="wallet-section container">
        <a className="back-link" href="#wallets">← Усі гаманці</a>
        <div className="wallet-title-row">
          <div>
            <p className="page-kicker">Вибраний гаманець</p>
            <h1>{wallet?.name || 'Гаманець'}</h1>
          </div>
          <span className="status-badge"><i /> Активний</span>
        </div>

        <div className="balance-panel">
          <p>Поточний баланс</p>
          <strong>{Number(wallet?.balance || 0).toLocaleString('uk-UA', { minimumFractionDigits: 2 })} <small>UAH</small></strong>
          <span>Оновлено щойно</span>
        </div>

        <div className="action-grid">
          {actions.map(([title, description, action]) => (
            <button className="action-card" type="button" onClick={() => { setOperation(action); setError('') }} key={title}>
              <span className="action-arrow">↗</span>
              <strong>{title}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>

        {operation && <form className="operation-form" onSubmit={async (event) => {
          event.preventDefault()
          setIsSubmitting(true)
          setError('')
          try {
            if (operation === 'transfer') await transfer(walletId, receiver, amount)
            else if (operation === 'deposit') await deposit(walletId, amount)
            else await withdraw(walletId, amount)
            const [walletData, history] = await Promise.all([getWallet(walletId), getHistory(walletId)])
            setWallet(walletData)
            setTransactions(history)
            setAmount('')
            setReceiver('')
            setOperation('')
          } catch (requestError) {
            setError(requestError.message)
          } finally {
            setIsSubmitting(false)
          }
        }}>
          <h3>{operation === 'deposit' ? 'Поповнити баланс' : operation === 'withdraw' ? 'Вивести кошти' : 'Переказати кошти'}</h3>
          {operation === 'transfer' && <input value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="Адреса гаманця отримувача" required />}
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Сума" required />
          <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Виконується...' : 'Підтвердити'}</button>
          <button className="text-button" type="button" onClick={() => setOperation('')}>Скасувати</button>
        </form>}

        {pendingTransfers.length > 0 && <section className="pending-transfers" aria-labelledby="pending-title">
          <div className="section-heading"><h2 id="pending-title">Вхідні перекази</h2></div>
          {pendingTransfers.map((transaction) => <div className="transaction-row" key={transaction.id}>
            <span>{transaction.amount} UAH від {transaction.sender}</span>
            <button className="text-button" type="button" onClick={async () => { await acceptTransfer(transaction.id); setPendingTransfers(pendingTransfers.filter((item) => item.id !== transaction.id)); window.location.reload() }}>Прийняти</button>
            <button className="text-button danger-button" type="button" onClick={async () => { await rejectTransfer(transaction.id); setPendingTransfers(pendingTransfers.filter((item) => item.id !== transaction.id)) }}>Відхилити</button>
          </div>)}
        </section>}

        <section className="transactions" aria-labelledby="transactions-title">
          <div className="section-heading">
            <div>
              <p className="page-kicker">Операції</p>
              <h2 id="transactions-title">Історія транзакцій</h2>
            </div>
            <button className="text-button" type="button">Фільтри <span>☷</span></button>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {transactions.length ? <div className="transaction-list">
            {transactions.map((transaction) => <div className="transaction-row" key={transaction.id}><span>{transaction.type}</span><b>{transaction.amount} UAH</b><small>{transaction.status}</small></div>)}
          </div> : <div className="transaction-empty">
            <span>◎</span>
            <p>Транзакцій ще немає</p>
            <small>Тут з’являться всі операції з цим гаманцем.</small>
            <button className="transaction-detail-button" type="button" disabled>Відкрити деталі транзакції</button>
          </div>}
        </section>
      </section>
    </main>
  )
}

export default WalletPage