import API from "./api.js"

export default class ProfileService {

    static async getProfiles (){
        return API.get("/profiles")
    }

    static async getProfilesMe (){
        return API.get("/profiles/me")
    }

    static async getProfilesByUserId (userId) {
        return API.get(`/profiles/${userId}`)
    }

    static async postProfilesMe (name, username){
        return API.post("/profiles/me", {
            name: name,
            username: username,
            sex: null,
            course: null,
            faculty: null
        })
    }

    static async patchProfilesMe (updatedData){
        return API.patch("/profiles/me", {
            ...updatedData,
        })
    }

    static async postProfilesAvatars(file) {
        const formData = new FormData();
        formData.append("avatar", file);

        return API.post("/profiles/avatars", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}