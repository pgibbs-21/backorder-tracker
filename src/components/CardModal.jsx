import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function CardModal({ card, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(card?.title || '')
  const [description, setDescription] = useState(card?.description || '')
  const [priority, setPriority] = useState(card?.priority || 'medium')
  const [dueDate, setDueDate] = useState(card?.due_date || '')
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ title: title.trim(), description: description.trim(), priority, due_date: dueDate.trim() })
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
          <h2 className="modal-title" id="modal-title">{card ? 'Edit Card' : 'New Card'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="f-title">Title</label>
            <input
              ref={titleRef}
              className="form-input"
              id="f-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="f-priority">Priority</label>
              <select className="form-select" id="f-priority" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="f-due">Due Date (optional)</label>
              <input
                className="form-input"
                id="f-due"
                type="text"
                placeholder="e.g. Apr 15 or ~2 weeks"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="f-description">Description</label>
            <textarea
              className="form-textarea"
              id="f-description"
              placeholder="Add details, notes, or context..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-save">{card ? 'Save Changes' : 'Add Card'}</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            {card && <button type="button" className="btn-delete" onClick={onDelete}>Delete</button>}
          </div>
        </form>
      </div>
    </div>
  )
}
