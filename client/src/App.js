import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Signup from './pages/Signup';
import CompleteSignup from './pages/CompleteSignup';
import Login from './pages/Login';
import NotesFeed from './pages/NotesFeed';
import NotesEditor from './pages/NotesEditor';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/complete-signup" element={<CompleteSignup/>} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/notes/:noteId" element={<NotesEditor />} />
        <Route path="/notes" element={<NotesFeed/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
