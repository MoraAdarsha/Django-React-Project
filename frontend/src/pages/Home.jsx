import { useState, useEffect } from 'react'
import api from '../api'
import Note from '../components/Notes'
import Toast from '../components/Toast'
import "../styles/Home.css" 
import { getErrorMessage } from '../utils/errorHandler'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Toast message state - used for overlay success messages
    const [toastMessage, setToastMessage] = useState("");
    
    const [username, setUsername] = useState("");
    
    // STEP 5: State variables for edit mode
    const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
    const [editingNoteId, setEditingNoteId] = useState(null); // ID of note being edited
    
    const navigate = useNavigate();

    useEffect(() => {
        getNotes();
        // Extract username from token (basic implementation)
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsername(payload.username || "User");
            } catch (e) {
                setUsername("User");
            }
        }
    }, []);

    const getNotes = async () => {
        try {
            const res = await api.get("/api/notes/");
            setNotes(res.data);
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to load notes");
            setError(errorMessage);
        }
    };

    const deleteNote = async (id) => {
        // STEP 4: Removed browser confirm popup
        // No more window.confirm() - cleaner UX

        try {
            const res = await api.delete(`/api/notes/delete/${id}/`);
            if (res.status === 204) {
                // Show success toast - appears as overlay, doesn't move content
                setToastMessage("Deleted the note successfully");
                // Refresh the notes list
                getNotes();
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to delete note");
            setError(errorMessage);
            setTimeout(() => setError(""), 5000);
        }
    }; 
    
    const createNote = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/notes/", {content, title});
            if (res.status === 201) {
                // STEP 3: Show success toast after adding note
                setToastMessage("Successfully added new note");
                // Clear form inputs
                setTitle("");
                setContent("");
                // Refresh notes list
                getNotes();
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to create note");
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // STEP 5: Function to handle editing a note
    // How edit mode works:
    // 1. Store the note's ID in editingNoteId state
    // 2. Pre-fill form inputs with note's current title and content
    // 3. Set isEditing to true - this changes form behavior
    const handleEditNote = (note) => {
        // Enter edit mode
        setIsEditing(true);
        // CRITICAL: Store which note we're editing (needed for API call)
        setEditingNoteId(note.id);
        // Pre-fill the form with existing note data
        setTitle(note.title);
        setContent(note.content);
        // Clear any previous error messages
        setError("");
        // Scroll to form so user can see it
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    // STEP 5: Function to update an existing note
    // Why PATCH is used: PATCH allows partial updates (only send changed fields)
    // PUT would require sending all fields. Django REST Framework supports both.
    const updateNote = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // FIXED: Use correct endpoint /api/notes/update/{id}/
            // Send PATCH request with title and content
            const res = await api.patch(`/api/notes/update/${editingNoteId}/`, {content, title});
            if (res.status === 200) {
                // Show success toast - overlay message
                setToastMessage("Edited the note successfully");
                // Clear the form inputs
                setTitle("");
                setContent("");
                // Exit edit mode - reset edit state
                setIsEditing(false);
                setEditingNoteId(null);
                // Refresh notes list to show updated note
                getNotes();
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error, "Failed to update note");
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // STEP 5: Function to cancel edit mode
    const cancelEdit = () => {
        // Exit edit mode
        setIsEditing(false);
        setEditingNoteId(null);
        // Clear the form
        setTitle("");
        setContent("");
        setError("");
    };

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setToastMessage("Logged out successfully");
        setTimeout(() => navigate("/login"), 500);
    };

    return <div className="home-container">
        {/* Header with greeting and logout */}
        <div className="home-header">
            <h1>Hi, {username} 👋</h1>
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>

        {/* Global error messages - still inline */}
        {error && <div className="error-message">{error}</div>}

        {/* Toast notification - appears as overlay at bottom-right */}
        <Toast 
            message={toastMessage} 
            onClose={() => setToastMessage("")}
        />

        {/* Notes section */}
        <div className="notes-section">
            <h2>Your Notes</h2>
            {notes.length === 0 ? (
                <div className="empty-state">
                    <p>No notes yet. Click "Add Note" below to create one.</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {notes.map((note) => (
                        <Note 
                            note={note} 
                            onDelete={deleteNote} 
                            onEdit={handleEditNote}
                            key={note.id} 
                        />
                    ))}
                </div>
            )}
        </div>

        {/* Create note form */}
        <div className="create-note-section">
            {/* STEP 5: Dynamic heading based on edit mode */}
            <h2>{isEditing ? "Edit Note" : "Add Note"}</h2>
            <p style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '18px', 
                color: '#555', 
                marginBottom: '15px', 
                fontStyle: 'italic',
                flexWrap: 'wrap'
            }}>
                <span>Hi {username} 👋</span>
                <span>How was your day? ✨</span>
            </p>
            {/* STEP 5: Form handles both create and update based on isEditing */}
            <form onSubmit={isEditing ? updateNote : createNote} className="note-form">
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    placeholder="Enter note title"
                />
                
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter note content"
                    rows="5"
                ></textarea>
                
                {/* STEP 5: Button shows different text based on mode */}
                <button 
                    className="primary-button" 
                    type="submit" 
                    disabled={loading}
                >
                    {loading 
                        ? (isEditing ? "Updating note..." : "Adding note...") 
                        : (isEditing ? "Update Note" : "Add Note")
                    }
                </button>
                
                {/* STEP 5: Show cancel button when editing */}
                {isEditing && (
                    <button 
                        type="button"
                        className="secondary-button" 
                        onClick={cancelEdit}
                        style={{ marginTop: '10px' }}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>
        </div>
    </div>

}

export default Home