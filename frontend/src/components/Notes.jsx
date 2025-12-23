import React, { useState } from 'react'
import "../styles/Note.css"

// STEP 5: Added onEdit callback to props
function Note({note, onDelete, onEdit}) {
    const [deleting, setDeleting] = useState(false);
    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US");

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(note.id);
        // Note: setDeleting(false) not needed as component will unmount
    };

    // STEP 5: Handler for edit button
    const handleEdit = () => {
        onEdit(note);
    };

    return <div className="note-container">
        <p className="note-title">{note.title}</p>
        <p className="note-content">{note.content}</p>
        <p className="note-date">{formattedDate}</p>
        
        {/* STEP 5: Added Edit button beside Delete */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
                className="edit-button" 
                onClick={handleEdit}
            >
                Edit
            </button>
            <button 
                className="delete-button" 
                onClick={handleDelete}
                disabled={deleting}
            >
                {deleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    </div>
    
}

export default Note