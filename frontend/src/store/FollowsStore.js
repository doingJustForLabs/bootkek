import FollowsService from "../services/follows.service.js";
import { checkAccessToken } from "../utils/token.js";

export default class ProfileStore {

    static async getFollowersByUserId (userId) {
        try {
            return await FollowsService.getProfilesFollowers(userId)
        } catch (error) {
            return await checkAccessToken(error, FollowsService.getProfilesFollowers, {userId})
        }
    }

    static async getFollowingByUserId (userId) {
        try {
            return await FollowsService.getProfilesFollowing(userId)
        } catch (error) {
            return await checkAccessToken(error, FollowsService.getProfilesFollowing, {userId})
        }
    }

    static async followByUserId (userId) {
        try {
            return await FollowsService.postProfilesFollow(userId)
        } catch (error) {
            return await checkAccessToken(error, FollowsService.postProfilesFollow, {userId})
        }
    }

    static async unfollowByUserId (userId) {
        try {
            return await FollowsService.deleteProfilesFollow(userId)
        } catch (error) {
            return await checkAccessToken(error, FollowsService.deleteProfilesFollow, {userId})
        }
    }

}

