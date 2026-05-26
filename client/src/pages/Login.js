import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { loginUser } from '../services/userService';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // 2. Initialize navigate

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            console.log("Login Success: ", data);

            // 3. Save the token so ProtectedRoute allows entry
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('user_role', data.role);

            // 4. Redirect the user to the notes feed
            navigate('/notes');

        } catch (error) {
            console.error("error logging in user: ", error);
            alert("Login failed. Check your credentials.");
        }
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Your email and password inputs */}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;