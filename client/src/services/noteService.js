const API_BASE_URL = "/api/notes/";

// Helper to handle bad HTTP status codes (4xx/5xx)
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const save_note = async (access_token, note_id, new_content, old_content) => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({ note_id, new_content, old_content })
        });
        if (response.ok) {
            const data = await response.clone().json();
            console.log(`message: ${data.message}`);
        }
        const data = await handleResponse(response);
        return data;
    } catch (error) {
        console.error("error saving user's notes", error);
        throw error;
    }
};

export const get_note = async (access_token, note_id) => {
    try {
        const response = await fetch(`${API_BASE_URL}${note_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        });
        if (response.ok) {
            const data = await response.clone().json();
            console.log(`note_id: ${data.note_id}`);
        }
        const data = await handleResponse(response);
        return data;            
    } catch (error) {
        console.error("error getting user's data", error);
        throw error;
    }
};

export const search_notes = async (access_token, query) => {
    try {
        const response = await fetch(`${API_BASE_URL}search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        });
        if (response.ok) {
            const data = await response.clone().json();
            console.log(`search results: ${data.results}`);
        }
        const data = await handleResponse(response);
        return data
    } catch (error) {
        console.error("error searching index", error);
        throw error;
    }
};

export const list_note_ids = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.clone().json();
            console.log(`note_ids: ${data.note_ids}`);
        }
        const data = await handleResponse(response);
        return data; 
    } catch (error) {
        console.error("error listing note IDs", error);
        throw error;
    }
};