import ProfileService from "../services/profile.service.js";
import { withTokenRetry } from "../utils/token.js";

export default class ProfileStore {

    static async createProfile(name, username) {
        return await withTokenRetry(ProfileService.postProfilesMe, name, username);
    }

    static async updateProfile(updatedData) {
        return await withTokenRetry(ProfileService.patchProfilesMe, updatedData);
    }

    static async getProfile() {
        return await withTokenRetry(ProfileService.getProfilesMe);
    }

    static async getProfileByUserId(userId) {
        return await withTokenRetry(ProfileService.getProfilesByUserId, userId);
    }

    static async getAllProfiles() {
        return await withTokenRetry(ProfileService.getProfiles);
    }

    static async setAvatar(file) {
        return await withTokenRetry(ProfileService.postProfilesAvatars, file);
    }

}
