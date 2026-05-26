import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import CompleteSignup from './pages/CompleteSignup';
import Login from './pages/Login';
import NotesFeed from './pages/NotesFeed';
import NotesEditor from './pages/NotesEditor';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute'; // Import the wrapper

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Signup/>} />
        <Route path="/complete-signup" element={<CompleteSignup/>} />
        <Route path="/login" element={<Login/>}/>

        {/* Protected Routes */}
        <Route 
          path="/notes/:noteId" 
          element={
            <ProtectedRoute>
              <NotesEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notes" 
          element={
            <ProtectedRoute>
              <NotesFeed/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;