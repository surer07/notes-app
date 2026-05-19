import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signupUser } from '../services/userService'

const Signup = () => {
    const navigate = useNavigate();

    // Initialize state variables for each input
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        setError('')

        try {
            // Wait for the signup request to finish
            await signupUser(username, email, password);
            // Redirect to the complete signup page on success
            navigate('/complete-signup');     
        } catch (err) {
            // Handle error if signup fails (e.g., email already exists)
            setError('Signup failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                {/* Username Input */}
                <div>
                    <label>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>

                {/* Email Input */}
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <button type="submit">Sign Up</button>
            </form>
            <Link to={`/login`}><h1>login</h1></Link>
        </div>
    );
}

export default Signup