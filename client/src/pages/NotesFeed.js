import React, {useState, useEffect} from "react";
import { list_note_ids, save_note } from "../services/noteService";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const NotesFeed = () => {
    const [access_token, set_access_token] = useState("")
    const [noteIds, set_note_ids] = useState([]);
    const [noteTitle, set_note_title] = useState("");
    const navigate = useNavigate(); 

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        set_access_token(token)

        const fetch_note_ids = async () => {
            if (token) {
                await list_note_ids(token).then(ids => set_note_ids(ids)).catch(err => console.error(err));
            }
        }

        fetch_note_ids();
    }, [noteTitle]);

    const open_notes_editor = (noteId) => {
        navigate(`/notes/${noteId}`);
    };

    const handle_create_note = (e) => {
        e.preventDefault();
        
        if (!noteTitle.trim()) {
            alert("Please enter a note title");
            return;
        }

        // 3. Pass a 'new' flag along with the typed title
        open_notes_editor('new', noteTitle);
        
        // Clear input field after navigating
        set_note_title("");
    };

    return (
        <div>
            <h3>Your Saved Notes</h3>
            <ul>
                {noteIds.map((id) => (
                    <li key={id}>
                        <button onClick={() => open_notes_editor(id)}>
                            Open {id}
                        </button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handle_create_note}>
                <input 
                    type="text" 
                    placeholder="Type note title" 
                    value={noteTitle}
                    onChange={(e) => set_note_title(e.target.value)} 
                />
                <button type="submit">Create new note</button>
            </form>
        </div>
    );
};

export default NotesFeed;