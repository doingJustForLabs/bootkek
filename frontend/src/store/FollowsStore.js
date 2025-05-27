import FollowsService from "../services/follows.service.js";
import { withTokenRetry } from "../utils/token.js";

export default class ProfileStore {

    static async getFollowersByUserId(userId) {
        return await withTokenRetry(FollowsService.getProfilesFollowers, userId);
    }

    static async getFollowingByUserId(userId) {
        return await withTokenRetry(FollowsService.getProfilesFollowing, userId);
    }

    static async followByUserId(userId) {
        return await withTokenRetry(FollowsService.postProfilesFollow, userId);
    }

    static async unfollowByUserId(userId) {
        return await withTokenRetry(FollowsService.deleteProfilesFollow, userId);
    }

}
