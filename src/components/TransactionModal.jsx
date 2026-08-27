import { useEffect, useState } from 'react'
import './TransactionModal.css'

function TransactionModal({ transaction, onClose }) {
  const [copiedField, setCopiedField] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!transaction) return null

  const numAmount = Number(transaction.amount || 0)
  const isDeposit = transaction.type === 'deposit'

  const feeRate = isDeposit ? 0 : 0.02
  const feeAmount = numAmount * feeRate
  const totalAmount = isDeposit ? numAmount : numAmount + feeAmount

  const typeLabels = {
    deposit: 'Поповнення балансу',
    withdraw: 'Виведення коштів',
    transfer: 'Переказ коштів',
  }

  const statusLabels = {
    completed: 'Виконано',
    pending: 'Очікує підтвердження',
    rejected: 'Відхилено',
  }

  const formattedDate = transaction.created_at
    ? new Date(transaction.created_at).toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Деталі транзакції #{transaction.id}</h2>
            <span className={`modal-badge ${transaction.status}`}>
              {statusLabels[transaction.status] || transaction.status}
            </span>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрити">
            ✕
          </button>
        </div>

        <div className="modal-amount-box">
          <p className="modal-amount-label">Сума транзакції</p>
          <p className="modal-amount-val">
            {numAmount.toLocaleString('uk-UA', { minimumFractionDigits: 2 })}
            <small>UAH</small>
          </p>
        </div>

        <div className="modal-details-grid">
          <div className="modal-row">
            <span className="modal-row-label">Тип операції</span>
            <span className="modal-row-value">{typeLabels[transaction.type] || transaction.type}</span>
          </div>

          <div className="modal-row">
            <span className="modal-row-label">Комісія сервісу</span>
            <span className="modal-row-value modal-fee-highlight">
              {isDeposit ? '0% (0.00 UAH)' : `2% (${feeAmount.toFixed(2)} UAH)`}
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-row-label">Разом з комісією</span>
            <span className="modal-row-value">
              {totalAmount.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} UAH
            </span>
          </div>

          {transaction.sender && (
            <div className="modal-row">
              <span className="modal-row-label">Гаманець відправника</span>
              <span className="modal-row-value">
                {transaction.sender}
                <button
                  className="modal-copy-btn"
                  type="button"
                  onClick={() => copyToClipboard(transaction.sender, 'sender')}
                >
                  {copiedField === 'sender' ? 'Скопійовано' : 'Копіювати'}
                </button>
              </span>
            </div>
          )}

          {transaction.receiver && (
            <div className="modal-row">
              <span className="modal-row-label">Гаманець отримувача</span>
              <span className="modal-row-value">
                {transaction.receiver}
                <button
                  className="modal-copy-btn"
                  type="button"
                  onClick={() => copyToClipboard(transaction.receiver, 'receiver')}
                >
                  {copiedField === 'receiver' ? 'Скопійовано' : 'Копіювати'}
                </button>
              </span>
            </div>
          )}

          <div className="modal-row">
            <span className="modal-row-label">Дата та час</span>
            <span className="modal-row-value">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal
