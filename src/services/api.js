const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AUTH_KEY = 'fintech-wallet-auth'

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY))
  } catch {
    return null
  }
}

export function saveAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

async function request(path, options = {}) {
  const auth = getAuth()
  const headers = { ...options.headers }
  if (auth?.access_token) headers.Authorization = `Bearer ${auth.access_token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Не вдалося підключитися до сервера')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) logout()
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).join(', ')
      : data.detail
    throw new Error(detail || 'Сталася помилка. Спробуйте ще раз')
  }
  return data
}

function jsonRequest(path, method, body) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function registerUser(data) {
  return jsonRequest('/auth/register', 'POST', data)
}

export async function loginUser(data) {
  const auth = await jsonRequest('/auth/login', 'POST', data)
  saveAuth(auth)
  return auth
}

export function getWallets() {
  return request('/wallets/user')
}

export function createWallet(data) {
  return jsonRequest('/wallets/', 'POST', data)
}

export function getWallet(walletId) {
  return request(`/wallets/user/${walletId}`)
}

export function getHistory(walletId) {
  return request(`/transactions/history/${walletId}`)
}

export function deposit(walletId, amount) {
  return jsonRequest('/transactions/deposit', 'POST', { wallet_id: walletId, amount })
}

export function withdraw(walletId, amount) {
  return jsonRequest('/transactions/withdraw', 'POST', { wallet_id: walletId, amount })
}

export function transfer(senderWalletId, receiverAddress, amount) {
  return jsonRequest('/transactions/transfer', 'POST', {
    sender_wallet_id: senderWalletId,
    receiver_address: receiverAddress,
    amount,
  })
}

export function getPendingTransfers() {
  return request('/transactions/pending')
}

export function acceptTransfer(transactionId) {
  return request(`/transactions/${transactionId}/accept`, { method: 'POST' })
}

export function rejectTransfer(transactionId) {
  return request(`/transactions/${transactionId}/reject`, { method: 'POST' })
}

export function getAdminUsers() {
  return request('/admin/users')
}

export function getAdminTransactions() {
  return request('/admin/transactions')
}

export function setUserBlocked(userId, blocked) {
  return request(`/admin/users/${userId}/${blocked ? 'block' : 'unblock'}`, { method: 'POST' })
}
