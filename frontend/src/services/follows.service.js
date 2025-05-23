import API from "./api.js"

export default class FollowsService {

    static async getProfilesFollowers (userId){
        return API.get(`/follows/${userId}/followers`)
    }

    static async getProfilesFollowing (userId){
        return API.get(`/follows/${userId}/following`)
    }

    static async postProfilesFollow (userId){
        return API.post(`/follows/${userId}`)
    }

    static async deleteProfilesFollow (userId){
        return API.delete(`/follows/${userId}`)
    }

}