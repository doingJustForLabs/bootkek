import API from "./api.js"

export default class ProfileService {

    static async getProfileMe (){
        return API.get("/profiles/me")
    }

    static async postProfileMe (name, username){
        return API.post("/profiles/me", {
            name: name,
            username: username,
            sex: null,
            course: null,
            faculty: null
        })
    }

    static async patchProfileMe (updatedData){
        return API.patch("/profiles/me", {
            ...updatedData,
        })
    }

    static async postAvatar(file) {
        const formData = new FormData();
        formData.append("avatar", file);

        return API.post("/profiles/avatars", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}