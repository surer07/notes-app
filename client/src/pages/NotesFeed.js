import React, {useState, useEffect} from "react";
import { list_note_ids, save_note } from "../services/noteService";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export const NotesFeed = () => {
    const [noteIds, setNoteIds] = useState([]);
    const [noteTitle, setNoteTitle] = useState("");
    const navigate = useNavigate(); 

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        
        if (token) {
            list_note_ids(token).then(ids => setNoteIds(ids)).catch(err => console.error(err));
        }
    }, [noteTitle]);

    const openNotesEditor = (noteId) => {
        navigate(`/notes/${noteId}`);
    };

    const handleCreateNote = (e) => {
        e.preventDefault();
        
        if (!noteTitle.trim()) {
            alert("Please enter a note title");
            return;
        }

        // 3. Pass a 'new' flag along with the typed title
        openNotesEditor('new', noteTitle);
        
        // Clear input field after navigating
        setNoteTitle("");
    };

    return (
        <div>
            <h3>Your Saved Notes</h3>
            <ul>
                {noteIds.map((id) => (
                    <li key={id}>
                        <button onClick={() => openNotesEditor(id)}>
                            Open {id}
                        </button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleCreateNote}>
                <input 
                    type="text" 
                    placeholder="Type note title" 
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)} 
                />
                <button type="submit">Create new note</button>
            </form>
        </div>
    );
};