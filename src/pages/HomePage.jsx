import Header from '../components/Header'
import shopCartIcon from '../assets/shopcart.svg'
import usersIcon from '../assets/users.svg'
import walletIcon from '../assets/wallet.svg'
import './HomePage.css'

function HomePage() {
  return (
    <main className="site-shell">
      <Header page="home" />

      <section className="hero container" id="top">
        <div className="hero-content">
          <h1>
            Гроші мають <em>допомагати</em>, а не ускладнювати
          </h1>
          <p className="hero-copy">
            Зберігайте, переказуйте та керуйте коштами в одному зручному місці.
            Швидко та безпечно.
          </p>
          <a className="button" href="#register">
            Почати
          </a>
        </div>
      </section>

      <section className="stats container" aria-label="Переваги PleaseHelp">
        <div>
          <p><strong>Швидкі перекази</strong>Кошти надходять за лічені секунди</p>
        </div>
        <div>
          <p><strong>Надійний захист</strong>Ваші дані й баланс під контролем</p>
        </div>
        <div>
          <p><strong>Без зайвого</strong>Лише потрібні фінансові інструменти</p>
        </div>
      </section>

      <section className="dashboard" aria-labelledby="dashboard-title">
        <div className="container">
          <h2 className="dashboard-title" id="dashboard-title">Dashboard</h2>
          <p className="dashboard-description">Загальна статистика</p>

          <div className="dashboard-cards">
            <article className="dashboard-card">
              <img src={usersIcon} alt="" />
              <p>Клієнтів</p>
              <strong>0</strong>
            </article>

            <article className="dashboard-card">
              <img src={shopCartIcon} alt="" />
              <p>Покупок</p>
              <strong>0</strong>
            </article>

            <article className="dashboard-card">
              <img src={walletIcon} alt="" />
              <p>Витрачено</p>
              <strong>0</strong>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
