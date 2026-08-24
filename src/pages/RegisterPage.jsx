import AuthForm from '../components/AuthForm'
import Header from '../components/Header'
import './AuthPage.css'

function RegisterPage() {
  return (
    <main className="site-shell auth-shell">
      <Header page="register" />
      <section className="auth-section container">
        <AuthForm type="register" />
      </section>
    </main>
  )
}

export default RegisterPage
