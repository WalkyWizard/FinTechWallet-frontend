import AuthForm from '../components/AuthForm'
import Header from '../components/Header'
import './AuthPage.css'

function LoginPage() {
  return (
    <main className="site-shell auth-shell">
      <Header page="login" />
      <section className="auth-section container">
        <AuthForm type="login" />
      </section>
    </main>
  )
}

export default LoginPage
