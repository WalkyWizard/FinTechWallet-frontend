import { useState } from 'react'
import hiddenEye from '../assets/hiddeneye.svg'
import openEye from '../assets/openeye.svg'
import { loginUser, registerUser } from '../services/api'
import './AuthForm.css'

function PasswordField({ value, onChange, error }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="form-field">
      <span>Пароль</span>

      <div className={`password-input ${error ? 'has-error' : ''}`}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="Введіть пароль"
          autoComplete="current-password"
          required
          minLength="8"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
        >
          <img src={visible ? openEye : hiddenEye} alt="" />
        </button>
      </div>

      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function AuthForm({ type }) {
  const isRegister = type === 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
    setErrors({ ...errors, [field]: '' })
  }

  const validateForm = () => {
    const nextErrors = {}

    if (isRegister && !form.name.trim()) {
      nextErrors.name = 'Вкажіть ваше ім’я'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Вкажіть електронну пошту'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Введіть коректну електронну пошту'
    }

    if (!form.password) {
      nextErrors.password = 'Вкажіть пароль'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Пароль має містити щонайменше 8 символів'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      if (isRegister) await registerUser(form)
      else await loginUser({ email: form.email, password: form.password })
      window.location.hash = isRegister ? 'login' : 'wallets'
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = isRegister ? 'Створити акаунт' : 'Увійти в акаунт'
  const description = isRegister
    ? 'Зареєструйтеся, щоб почати керувати своїм гаманцем'
    : 'Увійдіть, щоб керувати своїм гаманцем'

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <h1>{title}</h1>
      <p className="auth-description">{description}</p>

      <div className="form-fields">
        {isRegister && (
          <label className="form-field">
            <span>Ім’я</span>
            <input
              className={errors.name ? 'has-error' : ''}
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Введіть ім’я"
              autoComplete="name"
              required
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </label>
        )}

        <label className="form-field">
          <span>Електронна пошта</span>
          <input
            className={errors.email ? 'has-error' : ''}
            type="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="Введіть електронну пошту"
            autoComplete="email"
            required
          />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>

        <PasswordField
          value={form.password}
          onChange={updateField('password')}
          error={errors.password}
        />
      </div>

      <button className="button auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Обробка...' : isRegister ? 'Зареєструватися' : 'Увійти'}
      </button>

      {submitError && <p className="form-error" role="alert">{submitError}</p>}

      <p className="auth-switch">
        {isRegister ? 'Вже маєте акаунт?' : 'Ще не маєте акаунта?'}
        <a href={isRegister ? '#login' : '#register'}>
          {isRegister ? 'Увійти' : 'Зареєструватися'}
        </a>
      </p>
    </form>
  )
}

export default AuthForm
