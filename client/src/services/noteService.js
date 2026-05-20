const API_BASE_URL = "api/notes"

export const save_note = async (
    access_token, 
    note_id, 
    new_content, 
    old_content) => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                "note_id": note_id, 
                "new_content": new_content,
                "old_content": old_content})
        })
        // returns message
        return response.json()
    } catch (error) {
        console.error("error saving user's notes", error)
        throw error
    }
}

export const get_note = async (
    access_token,
    note_id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${note_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        })
        //returns note_id and content
        return response.json()            
        } catch (error) {
            console.error("error getting user's data", error)
            throw error
        }
    }

export const search_notes = async (access_token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        })
        //returns result
        return response.json()   
    } catch (error) {
        console.error("error searching index", error)
        throw error
    }
}

export const list_note_ids = async (token) => {
    // 1. Pass the URL and the configuration object containing your headers
    const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET', // Optional for GET requests, but good for clarity
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // 2. Fetch doesn't automatically throw on 4xx/5xx errors, you must check response.ok
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // 3. Manually parse the JSON body stream (equivalent to response.data)
    const data = await response.json();
    return data.note_ids; 
};