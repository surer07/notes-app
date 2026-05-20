import React, { useState, useEffect } from "react";
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { useParams } from 'react-router-dom';
import { save_note, get_note } from "../services/noteService";

const NotesEditor = () => {
  const [access_token, set_access_token] = useState("")
  const [saved_content, set_saved_content] = useState("") 
  const [note_content, set_note_content] = useState("# Start typing your note...");
  const [error, set_error] = useState("")
  const { noteId } = useParams();

  useEffect(() => {
    const fetch_note = async () => {
        try {
            const token = localStorage.getItem('access_token');
            set_access_token(token)
            const response = await get_note(token, noteId);
            const content = response.content || "";
            set_saved_content(content)
            set_note_content(content)
        } catch (error) {
            console.error(error);
            set_error("Failed to load note.");
        }
    }

  }, [noteId])

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
    } catch (error) {
      console.error(error);
      set_error("Failed to save note.");
    }

  }

  return (
    <div className="editor-container" style={{ padding: "20px" }}>
        <form onSubmit={handleSubmit}>
            <h2>{noteId}</h2>
            <SimpleMdeEditor 
            value={note_content} 
            onChange={onChange} 
            />
            <button type="submit">SAVE</button>
        </form>
    </div>
  );
}

export default NotesEditor