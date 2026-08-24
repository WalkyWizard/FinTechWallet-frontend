import './Header.css'

function Header({ page }) {
  const isHome = page === 'home'
  const authLink = page === 'login' ? '#register' : '#login'
  const authLabel = page === 'login' ? 'Створити акаунт' : 'Увійти'

  return (
    <header className="header container">
      <a className="brand" href="#top" aria-label="PleaseHelp — головна">
        Please<span>Help</span>
      </a>

      {isHome ? (
        <div className="header-actions">
          <a className="sign-in" href="#login">
            Увійти
          </a>
          <a className="button button-small" href="#register">
            Зареєструватися
          </a>
        </div>
      ) : (
        <a className="sign-in" href={authLink}>
          {authLabel}
        </a>
      )}
    </header>
  )
}

export default Header
