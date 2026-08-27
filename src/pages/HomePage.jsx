import { useEffect, useState } from 'react'
import Header from '../components/Header'
import UserTimeChart from '../components/UserTimeChart'
import shopCartIcon from '../assets/shopcart.svg'
import usersIcon from '../assets/users.svg'
import walletIcon from '../assets/wallet.svg'
import {
  getAuth,
  getDashboardClients,
  getDashboardTransactions,
  getDashboardUsersTime,
  getDashboardWithdraw,
} from '../services/api'
import './HomePage.css'

function HomePage() {
  const auth = getAuth()
  const isAuthenticated = Boolean(auth?.access_token)

  const [stats, setStats] = useState({
    clients: 0,
    transactions: 0,
    withdraw: '0.00',
    usersTime: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getDashboardClients(),
      getDashboardTransactions(),
      getDashboardWithdraw(),
      getDashboardUsersTime(),
    ]).then(([clientsRes, transactionsRes, withdrawRes, timeRes]) => {
      setStats({
        clients: clientsRes.status === 'fulfilled' ? clientsRes.value.clients || 0 : 0,
        transactions: transactionsRes.status === 'fulfilled' ? transactionsRes.value.transactions || 0 : 0,
        withdraw: withdrawRes.status === 'fulfilled' ? withdrawRes.value.total || '0.00' : '0.00',
        usersTime: timeRes.status === 'fulfilled' ? timeRes.value.created_at_list || [] : [],
      })
      setLoading(false)
    })
  }, [])

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
            Швидко, прозоро та безпечно.
          </p>
          {isAuthenticated ? (
            <a className="button" href="#wallets">
              Перейти до моїх гаманців
            </a>
          ) : (
            <div className="hero-buttons">
              <a className="button" href="#register">
                Почати роботу
              </a>
              <a className="button button-outline" href="#login">
                Увійти
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="stats container" aria-label="Переваги PleaseHelp">
        <div>
          <p><strong>Швидкі перекази</strong>Кошти надходять за лічені секунди</p>
        </div>
        <div>
          <p><strong>Надійний захист</strong>Ваші дані й баланс під повним контролем</p>
        </div>
        <div>
          <p><strong>Прозора комісія</strong>0% на поповнення, лише 2% на виведення та перекази</p>
        </div>
      </section>

      <section className="commission-section container" aria-labelledby="tariffs-title">
        <div className="section-title-wrap">
          <p className="page-kicker">Тарифи та комісії</p>
          <h2 id="tariffs-title">Чесні умови без прихованих платежів</h2>
        </div>
        <div className="commission-grid">
          <article className="commission-card">
            <span className="commission-percent">0%</span>
            <h3>Поповнення балансу</h3>
            <p>Зараховуйте будь-яку суму на ваш гаманець без жодної комісії.</p>
          </article>
          <article className="commission-card highlight">
            <span className="commission-percent">2%</span>
            <h3>Виведення коштів</h3>
            <p>Швидке виведення коштів на картку з фіксованою комісією 2%.</p>
          </article>
          <article className="commission-card">
            <span className="commission-percent">2%</span>
            <h3>Перекази між користувачами</h3>
            <p>Миттєві перекази за номером гаманця. Комісію 2% сплачує відправник.</p>
          </article>
        </div>
      </section>

      <section className="dashboard" id="dashboard" aria-labelledby="dashboard-title">
        <div className="container">
          <div className="section-title-wrap">
            <p className="page-kicker">Статистика платформи</p>
            <h2 className="dashboard-title" id="dashboard-title">Dashboard</h2>
            <p className="dashboard-description">Актуальні показники активності системи в реальному часі</p>
          </div>

          <div className="dashboard-cards">
            <article className="dashboard-card">
              <img src={usersIcon} alt="" />
              <p>Зареєстрованих клієнтів</p>
              <strong>{loading ? '...' : stats.clients}</strong>
            </article>

            <article className="dashboard-card">
              <img src={shopCartIcon} alt="" />
              <p>Виконаних транзакцій</p>
              <strong>{loading ? '...' : stats.transactions}</strong>
            </article>

            <article className="dashboard-card">
              <img src={walletIcon} alt="" />
              <p>Всього виведено коштів</p>
              <strong>
                {loading
                  ? '...'
                  : `${Number(stats.withdraw).toLocaleString('uk-UA', { minimumFractionDigits: 2 })} UAH`}
              </strong>
            </article>
          </div>

          <div className="dashboard-chart-card">
            <div className="chart-header">
              <div>
                <h3>Графік реєстрації нових користувачів по годинам</h3>
                <p>00:00 — 23:00</p>
              </div>
              <span className="chart-total-badge">
                Всього: <strong>{stats.usersTime.length}</strong> користувачів
              </span>
            </div>

            <UserTimeChart usersTime={stats.usersTime} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
