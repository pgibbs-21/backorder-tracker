import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function OrderModal({ order, onSave, onDelete, onClose }) {
  const [customer, setCustomer] = useState(order?.customer || '')
  const [item, setItem] = useState(order?.item || '')
  const [priority, setPriority] = useState(order?.priority || 'medium')
  const [eta, setEta] = useState(order?.eta || '')
  const [notes, setNotes] = useState(order?.notes || '')
  const customerRef = useRef(null)

  useEffect(() => {
    customerRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ customer: customer.trim(), item: item.trim(), priority, eta: eta.trim(), notes: notes.trim() })
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {order ? 'Edit Order' : 'New Backorder Order'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="f-customer">Customer Name</label>
            <input
              ref={customerRef}
              className="form-input"
              id="f-customer"
              type="text"
              placeholder="e.g. John Smith"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="f-item">Item / SKU</label>
            <input
              className="form-input"
              id="f-item"
              type="text"
              placeholder="e.g. SRAM Red AXS Derailleur"
              value={item}
              onChange={e => setItem(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="f-priority">Priority</label>
              <select className="form-select" id="f-priority" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="f-eta">ETA (optional)</label>
              <input
                className="form-input"
                id="f-eta"
                type="text"
                placeholder="e.g. ~2 weeks"
                value={eta}
                onChange={e => setEta(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="f-notes">Notes</label>
            <textarea
              className="form-textarea"
              id="f-notes"
              placeholder="Buyer contact, customer preference, special instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-save">
              {order ? 'Save Changes' : 'Add Order'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            {order && (
              <button type="button" className="btn-delete" onClick={onDelete}>Delete</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
