import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { getAuth, getWallets } from '../services/api'
import './WalletPage.css'

function WalletsPage() {
  const [wallets, setWallets] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!getAuth()?.access_token) {
      window.location.hash = 'login'
      return
    }
    getWallets().then(setWallets).catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <main className="site-shell wallet-shell">
      <Header page="wallets" />
      <section className="wallets-section container">
        <div className="page-heading">
          <div>
            <p className="page-kicker">Ваші фінанси</p>
            <h1>Мої гаманці</h1>
            <p>Керуйте всіма валютами в одному місці.</p>
          </div>
          <a className="button" href="#create-wallet">Створити гаманець <span>+</span></a>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {wallets.length ? (
          <div className="wallet-list">
            {wallets.map((wallet) => (
              <a className="wallet-list-item" href={`#wallet/${wallet.id}`} key={wallet.id}>
                <span><strong>{wallet.name}</strong><small>{wallet.wallet_address}</small></span>
                <b>{Number(wallet.balance).toLocaleString('uk-UA', { minimumFractionDigits: 2 })} UAH</b>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
          <div className="empty-icon">₿</div>
          <h2>Гаманців поки немає</h2>
          <p>Створіть перший гаманець, щоб почати керувати коштами.</p>
          <a className="button" href="#create-wallet">Створити гаманець</a>
          </div>
        )}
      </section>
    </main>
  )
}

export default WalletsPage