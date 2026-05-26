import React, { useState, useEffect } from "react";
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { useParams, useNavigate } from 'react-router-dom'; // 1. Imported useNavigate
import { save_note, get_note } from "../services/noteService";

const NotesEditor = () => {
  const [access_token, set_access_token] = useState("");
  const [saved_content, set_saved_content] = useState(""); 
  const [note_content, set_note_content] = useState("");
  const [error, set_error] = useState("");
  const { noteId } = useParams();
  const navigate = useNavigate(); // 2. Initialized the navigate function

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) set_access_token(token);
  }, []);

  useEffect(() => {
    const fetch_note = async () => {
        try {
            set_access_token(localStorage.getItem('access_token'));
            if (!access_token) return;

            const response = await get_note(access_token, noteId);
            const content = response.content || "";
            set_saved_content(content);
            set_note_content(content);
        } catch (error) {
            console.error(error);
            set_error("Failed to load note.");
        }
    };

    fetch_note();
  }, [noteId, access_token]);

  const onChange = (value) => {
    set_note_content(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    set_error("");

    try {
      await save_note(
        access_token,
        noteId,
        note_content,
        saved_content
      );
      set_saved_content(note_content);
      alert("Note saved successfully!");
    } catch (error) {
      console.error(error);
      set_error("Failed to save note.");
    }
  };

  return (
    <div className="editor-container" style={{ padding: "20px" }}>
        {/* 4. Back Button Placement */}
        <button 
          type="button" 
          onClick={() => navigate('/notes')} 
          style={{ marginBottom: '20px', cursor: 'pointer' }}
        >
          ← Back to Notes
        </button>

        <form onSubmit={handleSubmit}>
            <h2>Editing: {noteId}</h2>
            <SimpleMdeEditor 
              value={note_content} 
              onChange={onChange} 
            />
            <button type="submit">SAVE</button>
        </form>
    </div>
  );
};

export default NotesEditor;