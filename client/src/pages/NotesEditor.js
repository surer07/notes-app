import React, { useState, useEffect } from "react";
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { useParams } from 'react-router-dom';
import { save_note, get_note } from "../services/noteService";

export default function NotesEditor() {
  const [access_token, set_access_token] = useState("")
  const [saved_content, set_saved_content] = useState("") 
  const [note_content, set_note_content] = useState("# Start typing your note...");
  const { noteId } = useParams();

  useEffect(async () => {
    set_access_token(localStorage.getItem('access_token'))

    content = await get_note(access_token, noteId).content
    set_saved_content(content)
    set_note_content(content)

  }, [])

  const onChange = (value) => {
    set_note_content(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    await save_note(access_token, noteId, note_content, saved_content)
    set_saved_content(note_content)

  }

  return (
    <div className="editor-container" style={{ padding: "20px" }}>
        <form onSubmit={handleSubmit}>
            <h2>{noteId}</h2>
            <SimpleMdeEditor 
            value={noteContent} 
            onChange={onChange} 
            />
            <button type="submit">SAVE</button>
        </form>
    </div>
  );
}