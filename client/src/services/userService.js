const API_BASE_URL = "http://auth-server:4000"

//takes username, email and password and creates a new user
export const signupUser = async (username, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username, 
                email, 
                password
            })
        })
        if (response.status === 201) {
            return { success: true };
        }
        return await response.json()

    } catch (error) {
        console.error("error in creating user: ", error)
        throw error
    }
}

//takes email and password and return refresh and access tokens
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            // If the server returns 400 or 401, read the error message
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        console.error("error logging in user: ", error);
        throw error;
    }
};

//takes refresh token and return access token
export const getNewToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        return await response.json()
    } catch (error) {
        console.error("error getting new access token: ", error)
        throw error
    }
}

//takes refresh token and logout the user
export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        if (response.status === 204) {
            return { success: true };
        }
    } catch (error) {
        console.error("error logging out user: ", error)
        throw error
    }
}
