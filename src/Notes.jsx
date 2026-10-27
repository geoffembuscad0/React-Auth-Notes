import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Notes({ user }) {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  // Fetch all notes for current user
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching notes:', error.message)
    else setNotes(data)
  }

  // Create or Update Note
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return

    setLoading(true)

    if (editingNoteId) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingNoteId)

      if (error) console.error('Error updating note:', error.message)
      else setEditingNoteId(null)
    } else {
      // Insert new note
      const { error } = await supabase
        .from('notes')
        .insert([{ title, content, user_id: user.id }])

      if (error) console.error('Error adding note:', error.message)
    }

    setTitle('')
    setContent('')
    setLoading(false)
    fetchNotes()
  }

  // Edit Note Setup
  const handleEdit = (note) => {
    setEditingNoteId(note.id)
    setTitle(note.title || '')
    setContent(note.content || '')
  }

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setTitle('')
    setContent('')
  }

  // Delete Note
  const handleDelete = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) console.error('Error deleting note:', error.message)
    else fetchNotes()
  }

  // Sign Out
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Logged in as: {user.email}</h3>
        <button onClick={handleLogout} style={{ padding: '6px 12px' }}>Sign Out</button>
      </header>

      <hr />

      {/* Note Input Form */}
      <form onSubmit={handleSubmit} style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '6px' }}>
        <h4>{editingNoteId ? 'Edit Note' : 'Create New Note'}</h4>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        <textarea
          placeholder="Content..."
          value={content}
          rows="4"
          onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        <div>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', marginRight: '8px' }}>
            {editingNoteId ? 'Update Note' : 'Add Note'}
          </button>
          {editingNoteId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Notes List */}
      <h4>Your Notes</h4>
      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} style={{ border: '1px solid #eee', padding: '12px', marginBottom: '10px', borderRadius: '4px' }}>
            <h5 style={{ margin: '0 0 8px 0' }}>{note.title || 'Untitled'}</h5>
            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }}>{note.content}</p>
            <small style={{ color: '#666' }}>{new Date(note.created_at).toLocaleString()}</small>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleEdit(note)} style={{ marginRight: '8px' }}>Edit</button>
              <button onClick={() => handleDelete(note.id)} style={{ color: 'red' }}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}