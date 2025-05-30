import FollowsService from "../services/follows.service.js";
import { withTokenRetry } from "../utils/token.js";

export default class ProfileStore {

    static async getFollowersByUserId(userId, limit = 5, page = 1) {
        return await withTokenRetry(FollowsService.getProfilesFollowers, userId, limit, page);
    }

    static async getFollowingByUserId(userId, limit = 5, page = 1) {
        return await withTokenRetry(FollowsService.getProfilesFollowings, userId, limit, page);
    }

    static async followByUserId(userId) {
        return await withTokenRetry(FollowsService.postProfilesFollow, userId);
    }

    static async unfollowByUserId(userId) {
        return await withTokenRetry(FollowsService.deleteProfilesFollow, userId);
    }

}
