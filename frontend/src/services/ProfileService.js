import API from "../http/api.js"

export default class ProfileService {

    static async getProfileMe (){
        return API.get("/profiles/me")
    }

    static async postProfileMe (name, username){
        return API.post("/profiles/me", {
            name: name,
            username: username,
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

        return API.post("/avatars", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async getAvatar (basename, fileSize){
        return API.get(`/profiles/avatars/${basename}`, {
            params: { file_size: fileSize }
        });
    }

}