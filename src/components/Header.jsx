import './Header.css'
import { getAuth, logout } from '../services/api'

function Header({ page }) {
  const auth = getAuth()
  const isAuthenticated = Boolean(auth?.access_token)
  const isAdmin = auth?.role === 'admin'

  const handleLogout = () => {
    logout()
    window.location.hash = 'login'
  }

  return (
    <header className="header container">
      <a className="brand" href="#home" aria-label="PleaseHelp — головна">
        Please<span>Help</span>
      </a>

      <nav className="header-nav">
        <a className={`nav-link ${page === 'home' ? 'active' : ''}`} href="#home">
          Головна
        </a>
        {isAuthenticated && (
          <a className={`nav-link ${page === 'wallets' || page === 'wallet' ? 'active' : ''}`} href="#wallets">
            Мої гаманці
          </a>
        )}
        {isAuthenticated && isAdmin && (
          <a className={`nav-link ${page === 'admin' ? 'active' : ''}`} href="#admin">
            Адмін-панель
          </a>
        )}
      </nav>

      <div className="header-actions">
        {isAuthenticated ? (
          <>
            <a className="button button-small" href="#create-wallet">
              + Створити гаманець
            </a>
            <button className="sign-in header-button logout-button" type="button" onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <a className={`sign-in ${page === 'login' ? 'active-auth' : ''}`} href="#login">
              Увійти
            </a>
            <a className="button button-small" href="#register">
              Зареєструватися
            </a>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
