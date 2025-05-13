import ProfileService from "../services/profile.service.js";
import { checkAccessToken } from "../utils/token.js";

export default class ProfileStore {

    static async createProfile(name, username) {
        try {
            return await ProfileService.postProfilesMe(name, username)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.postProfilesMe, {name, username})
        }
    }

    static async updateProfile(updatedData) {
        try {
            return await ProfileService.patchProfilesMe(updatedData)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.patchProfilesMe, {updatedData})
        }
    }

    static async getProfile() {
        try {
            return await ProfileService.getProfilesMe()
        } catch (error) {
            return await checkAccessToken(error, ProfileService.getProfilesMe, {})
        }
    }

    static async getProfileByUserId(userId) {
        try {
            return await ProfileService.getProfilesByUserId(userId)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.getProfilesByUserId, {userId})
        }
    }

    static async getAllProfiles() {
        try {
            return await ProfileService.getProfiles()
        } catch (error) {
            return await checkAccessToken(error, ProfileService.getProfiles, {})
        }
    }

    static async setAvatar(file) {
        try {
            return await ProfileService.postProfilesAvatars(file)
        } catch (error) {
            return await checkAccessToken(error, ProfileService.postProfilesAvatars, {file})
        }
    }

}

