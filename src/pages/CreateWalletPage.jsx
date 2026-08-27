import { useState } from 'react'
import Header from '../components/Header'
import { createWallet } from '../services/api'
import './AuthPage.css'
import './WalletPage.css'

function CreateWalletPage() {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!/^\d{16}$/.test(number)) {
      setError('Введіть рівно 16 цифр')
      return
    }
    setIsSubmitting(true)
    createWallet({ name: name.trim(), wallet_address: number })
      .then(() => { window.location.hash = 'wallets' })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <main className="site-shell auth-shell">
      <Header page="create-wallet" />
      <section className="auth-section container">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <p className="auth-kicker">Новий гаманець</p>
          <h1>Створити гаманець</h1>
          <p className="auth-description">Додайте назву та 16 цифр для нового гаманця.</p>
          <div className="form-fields">
            <label className="form-field">
              <span>Назва гаманця</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Наприклад, Основний" required />
            </label>
            <label className="form-field">
              <span>Номер гаманця</span>
              <input className={error ? 'has-error' : ''} type="text" inputMode="numeric" maxLength="16" value={number} onChange={(event) => { setNumber(event.target.value.replace(/\D/g, '')); setError('') }} placeholder="0000 0000 0000 0000" required />
              {error && <small className="field-error">{error}</small>}
            </label>
          </div>
          <button className="button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Створення...' : 'Створити гаманець'}</button>
          <p className="auth-switch"><a href="#wallets">Повернутися до гаманців</a></p>
        </form>
      </section>
    </main>
  )
}

export default CreateWalletPage