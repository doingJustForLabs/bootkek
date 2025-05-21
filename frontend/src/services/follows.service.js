import API from "./api.js"

export default class FollowsService {

    static async getProfilesFollowers (userId){
        return API.get(`/profiles/${userId}/followers`)
    }

    static async getProfilesFollowing (userId){
        return API.get(`/profiles/${userId}/following`)
    }

    static async postProfilesFollow (userId){
        return API.post(`/profiles/${userId}`)
    }

    static async deleteProfilesFollow (userId){
        return API.delete(`/profiles/${userId}`)
    }

}