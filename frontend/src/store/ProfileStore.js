import ProfileService from "../services/profile.service.js";
import { checkAccessToken } from "../utils/token.js";

export default class ProfileStore {

    static async createProfile(name, username) {
        try {
            return await ProfileService.postProfileMe(name, username)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.postProfileMe, {name, username})
        }
    }

    static async updateProfile(updatedData) {
        try {
            return await ProfileService.patchProfileMe(updatedData)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.patchProfileMe, {updatedData})
        }
    }

    static async getProfile() {
        try {
            return await ProfileService.getProfileMe()
        } catch (error) {
            return await checkAccessToken(error, ProfileService.getProfileMe, {})
        }
    }

    static async getProfileByUserId(userId) {
        try {
            return await ProfileService.getProfileByUserId(userId)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.getProfileByUserId, {userId})
        }
    }

    static async setAvatar(file) {
        try {
            return await ProfileService.postAvatar(file)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.postAvatar, {file})
        }
    }

}

