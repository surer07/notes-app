import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/userService'

const Login = () => {
    const navigate = useNavigate();

    // Initialize state variables for each input
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await loginUser(email, password);
            console.log("Login Success:", data);

            // Store tokens for authentication
            localStorage.setItem('accessToken', data.accessToken);
            
            // Optional: Store the role locally if you need it for route guarding later
            localStorage.setItem('role', data.role);

            // Redirect based on the user's role
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/notes');
            }
            
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login