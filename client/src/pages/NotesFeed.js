import React, { useState, useEffect } from "react";
import { list_note_ids, save_note, search_notes } from "../services/noteService"; // Added search_notes
import { useNavigate } from 'react-router-dom';

const NotesFeed = () => {
    const [access_token, set_access_token] = useState("");
    const [noteIds, set_note_ids] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // New state for search input
    const [noteTitle, set_note_title] = useState("");
    const navigate = useNavigate(); 

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) set_access_token(token);
    }, []);

    // 1. Initial Load: Fetch all Note IDs
    useEffect(() => {
        set_access_token(localStorage.getItem('access_token'));
        if (!access_token) return;
        
        const fetch_note_ids = async () => {
            if (access_token) {
                try {
                    const data = await list_note_ids(access_token);
                    set_note_ids(data?.note_ids || []);
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetch_note_ids();
    }, [noteTitle, access_token]);

    // 2. Trigger Search against the Backend Index when user types
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            set_access_token(localStorage.getItem('access_token'));
            if (!access_token) return;

            if (searchQuery.trim() === "") {
                try {
                    // FIXED: Await the response completely, then apply safe fallback
                    const data = await list_note_ids(access_token);
                    set_note_ids(data?.note_ids || []);
                } catch (err) {
                    console.error(err);
                }
            } else {
                // Query the Flask backend index
                try {
                    const data = await search_notes(access_token, searchQuery);
                    // Assuming your backend returns a structure like: { results: ["id1", "id2"] }
                    set_note_ids(data.results || []);
                } catch (err) {
                    console.error("Search failed:", err);
                }
            }
        }, 300); // 300ms debounce to prevent hitting server on every keystroke

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, access_token]);

    const open_notes_editor = (noteId) => {
        navigate(`/notes/${noteId}`);
    };

    const handle_create_note = (e) => {
        e.preventDefault();
        if (!noteTitle.trim()) {
            alert("Please enter a note title");
            return;
        }

        save_note(access_token, noteTitle, "", "")
        open_notes_editor(noteTitle);
        set_note_title("");
    };

    return (
        <div>
            {/* SEARCH INPUT */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search note contents..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            <h3>Your Saved Notes</h3>
            <ul>
                {noteIds.length === 0 ? <p>No notes found</p> : null}
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