

import { GENERAL_BACKEND_BASE_URL } from "./constants"
import type { Collection, Collections, Entry, Mood, Chapter } from "./types"
import { getCookie } from "./utilities/csrf";



const csrfToken = getCookie("csrftoken");

export const createCollection = async (collection: Collection): Promise<any> => {
    try {
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/create-new/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",

            body: JSON.stringify({
                "name": collection.name,
                "color": collection.color
            })
        });

        if (!response.ok) {
            return response.statusText;
        }

        const data: Collections = await response.json();

        console.log(data)

        return data;

    } catch (error) {

        return error;
    }
}


export const GetAllCollections = async (): Promise<any> => {
    try {
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/all/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            return response.statusText
        }

        const data: Collections = await response.json()

        console.log("in get collection", data);


        return data;

    } catch (error) {
        return error
    }

}

export const DeleteCollection = async (id: number) => {
    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/delete/${id}/`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({})
        })


        if (!response) {
            return response.statusText
        }

        if (response.status == 200) {
            return true;
        }

        return false;

    } catch (error) {
        return false;
    }
}


export const CreateMood = async (mood: Mood): Promise<any> => {

    try {

        console.log("in create mood", mood)

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/create-new/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || "",
            },
            credentials: "include",

            body: JSON.stringify(mood),

        })

        if (!response.ok) {
            return false;
        }

        if (response.status === 201) {
            return true;
        }

    } catch (error) {
        return false;
    }

}


export const GetAllMood = async () => {
    try {
        console.log("in mood fetch")
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/all/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            credentials: 'include',


        })


        if (!response) {
            return ({
                "fetched": false,
            })
        }



        if (response.status === 200) {
            const data = await response.json()
            return {
                "fetched": true,
                "data": data.data
            }
        }
        else {
            return ({
                "fetched": false,
            })

        }

    } catch (error) {
        return ({
            "fetched": false,
        })
    }
}


export const DeleteMood = async (id: number) => {
    try {
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/delete/${id}/`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({})
        })


        if (!response) {
            return response.statusText
        }

        if (response.status == 200) {
            return true;
        }
        else {
            return false;
        }



    } catch (error) {
        return false;
    }
}


export const CreateNewEntry = async (entry: any): Promise<any> => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/create-new/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
            },

            'credentials': 'include',

            body: JSON.stringify({
                "title": entry.title,
                "content": entry.content,
                "collection": entry.collection,
                "mood": entry.mood,
                "chapter": entry.chapter
            })

        })


        if (!response.ok) {
            return {
                "created": false,
                "detail": response.statusText
            }
        }

        if (response.status == 201) {
            return {
                "created": true,
            }
        }

    } catch (error) {

        return {
            "created": false,
            "detail": error
        }
    }


}


export const UpdateEntry = async (id: number, updatedEntry:any): Promise<any> => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/details/${id}/`, {
            method: "PATCH",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || "",
            },

            'credentials': 'include',


            body : JSON.stringify(updatedEntry)


        })


        if (!response.ok) {
            return {
                "updated": false,
                "detail": response.statusText
            }
        }

        if (response.status == 200) {
            return {
                "updated": true,
            }
        }

    } catch (error) {

        return {
            "updated": false,
            "detail": error
        }
    }


}

export const GetAllEntries = async () => {
    try {
        console.log("in entries fetch")
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/all/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            credentials: 'include',


        })


        if (!response) {
            return ({
                "fetched": false,
            })
        }



        if (response.status === 200) {
            const data = await response.json()
            return {
                "fetched": true,
                "data": data.data
            }
        }
        else {
            return ({
                "fetched": false,
            })

        }

    } catch (error) {
        return ({
            "fetched": false,
        })
    }
}

export const CreateNewChapter = async (chapter: any): Promise<any> => {

    try {
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/create-new/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
            },

            'credentials': 'include',

            body: JSON.stringify({
                "color": chapter.color,
                "title": chapter.title,
                "decription": chapter.description,
                "collection": chapter.collection,
            })

        })


        if (!response.ok) {
            return {
                "created": false,
                "detail": response.statusText
            }
        }

        if (response.status == 201) {
            return {
                "created": true,

            }
        }

    } catch (error) {

        return {
            "created": false,
            "detail": error
        }
    }


}


export const GetAllChapter = async () => {
    try {
        console.log("in chapter fetch")
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/all/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            credentials: 'include',


        })


        if (!response) {
            return ({
                "fetched": false,
            })
        }



        if (response.status === 200) {
            const data = await response.json()
            return {
                "fetched": true,
                "data": data.data
            }
        }
        else {
            return ({
                "fetched": false,
            })

        }

    } catch (error) {
        return ({
            "fetched": false,
        })
    }
}


export const DeleteEntry = async (id: number) => {
    try {
        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/details/${id}/`, {

            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({})
        })


        if (!response) {
            return response.statusText
        }

        if (response.status == 204) {
            return true;
        }
        else {
            return false;
        }

    } catch (error) {
        return false;
    }
}





export const ArchiveEntry = async (id: number, is_archived:boolean) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/archive/${id}/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            'credentials': 'include',

            body: JSON.stringify({
                "is_archived": is_archived
            })
        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}


export const ArchiveChapter = async (id: number, is_archived:boolean) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/archive/${id}/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            'credentials': 'include',

            body: JSON.stringify({
                "is_archived": is_archived
            })


        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}


export const FavouriteChapter = async (id: number, is_favourite: boolean) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/mark-favourite/${id}/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            'credentials': 'include',

            body: JSON.stringify({
                "is_favourite": is_favourite
            })

        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}

export const FavouriteEntry = async (id: number, is_favourite: boolean) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/mark-favourite/${id}/`, {
            method: "POST",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            'credentials': 'include',

            body: JSON.stringify({
                "is_favourite": is_favourite
            })
        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}


export const DeleteChapter = async (id: number) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/delete/${id}/`, {
            method: "DELETE",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },

            'credentials': 'include',


        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}

export const UpdateChapter = async (id: number, updatedChapter:any) => {

    try {

        const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/update/${id}/`, {
            method: "PATCH",

            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || ""
            },
            'credentials': 'include',

            body : JSON.stringify({
                "color": updatedChapter.color,
                "title": updatedChapter.title,
                "decription": updatedChapter.description,
                "collection": updatedChapter.collection,
            })


        })

        if (!response.ok) {
            return false
        }

        if (response.status == 200) {
            return true;
        }


    } catch (error) {
        return false;
    }

}




