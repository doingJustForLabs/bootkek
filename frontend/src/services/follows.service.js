import API from "./api.js"

export default class FollowsService {

    static async getProfilesFollowers (userId, limit = 5, page = 1) {
        return API.get(`/follows/${userId}/followers`, {
            params: {
                limit,
                page,
            }
        })
    }

    static async getProfilesFollowings (userId, limit = 5, page = 1) {
        return API.get(`/follows/${userId}/followings`, {
            params: {
                limit,
                page,
            }
        })
    }

    static async postProfilesFollow (userId){
        return API.post(`/follows/${userId}`)
    }

    static async deleteProfilesFollow (userId){
        return API.delete(`/follows/${userId}`)
    }

}