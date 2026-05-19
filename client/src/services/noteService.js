const API_BASE_URL = "http://notes-server:5000/api"

export const save_note = async (
    access_token, 
    note_id, 
    new_content, 
    old_content) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
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
            const response = await fetch(`${API_BASE_URL}/notes/${note_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            }
        })
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
        return response.json()   
    } catch (error) {
        console.error("error searching index", error)
        throw error
    }
}