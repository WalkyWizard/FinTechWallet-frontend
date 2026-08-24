import Header from '../components/Header'
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
    </main>
  )
}

export default HomePage
