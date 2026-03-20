import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || '/api/students'
const HEALTH = API.startsWith('http') ? `${new URL(API).origin}/health` : '/health'

// ── Toast hook ──────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return { toasts, push }
}

// ── Validation ───────────────────────────────────────────────
function validate({ name, email, mobileNo }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Required'
  else if (name.length > 100) errors.name = 'Max 100 chars'

  if (!email.trim()) errors.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email'
  else if (email.length > 150) errors.email = 'Max 150 chars'

  if (!mobileNo.trim()) errors.mobileNo = 'Required'
  else if (mobileNo.length > 20) errors.mobileNo = 'Max 20 chars'

  return errors
}

// ── Avatar letter ────────────────────────────────────────────
const avatarLetter = name => (name || '?')[0].toUpperCase()

// ── Student Card ─────────────────────────────────────────────
function StudentCard({ student, onDelete, onUpdate, toast }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: student.name, email: student.email, mobileNo: student.mobileNo })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const change = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const save = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Update failed')
      onUpdate({ ...student, ...form })
      setEditing(false)
      toast('Student updated ✓')
    } catch {
      toast('Failed to update student', 'error')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setForm({ name: student.name, email: student.email, mobileNo: student.mobileNo })
    setErrors({})
    setEditing(false)
  }

  return (
    <div className={`student-card ${editing ? 'editing' : ''}`}>
      <div className="avatar">{avatarLetter(student.name)}</div>

      <div className="student-info">
        <div className="name">{student.name}</div>
        <div className="meta">
          <span>✉ {student.email}</span>
          <span>📱 {student.mobileNo}</span>
        </div>
      </div>

      <div className="card-actions">
        {!editing && (
          <>
            <button className="btn btn-edit" onClick={() => setEditing(true)}>✏ Edit</button>
            <button className="btn btn-danger" onClick={() => onDelete(student.id)}>🗑</button>
          </>
        )}
        {editing && (
          <>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? '…' : '✓ Save'}
            </button>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
          </>
        )}
      </div>

      {editing && (
        <div className="edit-form" style={{ gridColumn: '1 / -1' }}>
          <div>
            <input
              value={form.name}
              onChange={change('name')}
              placeholder="Full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div>
            <input
              value={form.email}
              onChange={change('email')}
              placeholder="Email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div>
            <input
              value={form.mobileNo}
              onChange={change('mobileNo')}
              placeholder="Mobile no."
              className={errors.mobileNo ? 'error' : ''}
            />
            {errors.mobileNo && <span className="error-text">{errors.mobileNo}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const { toasts, push: toast } = useToast()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState('checking')
  const [form, setForm] = useState({ name: '', email: '', mobileNo: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error()
      setStudents(await res.json())
    } catch {
      toast('Could not load students', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(HEALTH)
      setHealth(res.ok ? 'healthy' : 'unhealthy')
    } catch {
      setHealth('unhealthy')
    }
  }, [])

  useEffect(() => {
    fetchStudents()
    checkHealth()
    const t = setInterval(checkHealth, 30000)
    return () => clearInterval(t)
  }, [fetchStudents, checkHealth])

  const change = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const msg = await res.text()
        toast(msg || `Request failed (${res.status})`, 'error')
        return
      }
      const created = await res.json()
      setStudents(s => [...s, created])
      setForm({ name: '', email: '', mobileNo: '' })
      toast('Student added ✓')
    } catch (err) {
      toast(`Failed to add student: ${err?.message || 'Network error'}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteStudent = async id => {
    if (!confirm('Delete this student?')) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setStudents(s => s.filter(x => x.id !== id))
      toast('Student deleted')
    } catch {
      toast('Failed to delete student', 'error')
    }
  }

  const updateStudent = updated =>
    setStudents(s => s.map(x => (x.id === updated.id ? updated : x)))

  const healthLabel = health === 'checking' ? 'Checking…' : health === 'healthy' ? 'API healthy' : 'API offline'
  const dotClass   = health === 'checking' ? 'grey' : health === 'healthy' ? 'green' : 'red'

  return (
    <>
      {/* Header */}
      <header className="header">
        <h1>🎓 Student Info <span>System</span></h1>
        <div className="health-badge">
          <span className={`dot ${dotClass}`} />
          {healthLabel}
        </div>
      </header>

      <main className="container">
        {/* Add form */}
        <div className="form-card">
          <h2>➕ Add New Student</h2>
          <form onSubmit={submit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={change('name')}
                  placeholder="e.g. Jayaru"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={change('email')}
                  placeholder="e.g. jayaru@email.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Mobile No.</label>
                <input
                  value={form.mobileNo}
                  onChange={change('mobileNo')}
                  placeholder="e.g. 0771234567"
                  className={errors.mobileNo ? 'error' : ''}
                />
                {errors.mobileNo && <span className="error-text">{errors.mobileNo}</span>}
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '…' : '➕ Add'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="list-header">
          <h2>Students</h2>
          <span className="count-badge">{students.length}</span>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎒</div>
            <p>No students yet — add one above!</p>
          </div>
        ) : (
          students.map(s => (
            <StudentCard
              key={s.id}
              student={s}
              onDelete={deleteStudent}
              onUpdate={updateStudent}
              toast={toast}
            />
          ))
        )}
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  )
}
