import './Header.css'
import { getAuth, logout } from '../services/api'

function Header({ page }) {
  const isHome = page === 'home'
  const isWalletArea = page === 'wallets' || page === 'wallet'
  const isAuthenticated = Boolean(getAuth()?.access_token)
  const authLink = page === 'login' ? '#register' : '#login'
  const authLabel = page === 'login' ? 'Створити акаунт' : 'Увійти'

  return (
    <header className="header container">
      <a className="brand" href="#top" aria-label="PleaseHelp — головна">
        Please<span>Help</span>
      </a>

      {isHome && !isAuthenticated ? (
        <div className="header-actions">
          <a className="sign-in" href="#login">
            Увійти
          </a>
          <a className="button button-small" href="#register">
            Зареєструватися
          </a>
        </div>
      ) : isWalletArea ? (
        <div className="header-actions">
          <a className="sign-in" href="#wallets">Мої гаманці</a>
          {getAuth()?.role === 'admin' && <a className="sign-in" href="#admin">Адмін-панель</a>}
          <a className="button button-small" href="#create-wallet">Створити гаманець</a>
          <button className="sign-in header-button" type="button" onClick={() => { logout(); window.location.hash = 'login' }}>Вийти</button>
        </div>
      ) : page === 'admin' ? (
        <div className="header-actions">
          <a className="sign-in" href="#wallets">Мої гаманці</a>
          <button className="sign-in header-button" type="button" onClick={() => { logout(); window.location.hash = 'login' }}>Вийти</button>
        </div>
      ) : (
        isAuthenticated
          ? <button className="sign-in header-button" type="button" onClick={() => { logout(); window.location.hash = 'login' }}>Вийти</button>
          : <a className="sign-in" href={authLink}>{authLabel}</a>
      )}
    </header>
  )
}

export default Header
