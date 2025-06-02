import API from "./api.js"

export default class SearchService {

    static async getSearchProfiles(keyword, page, limit, filter) {
        console.log('Поиск вызван с:', keyword, filter);
        return API.get("/search", {
            params: {
                keyword: keyword,
                page: page,
                limit: limit,
                ...filter
            }
        })
    }
};