import API from "./api.js"

export default class EnumsService {

    static async getEnumsSkills () {
        return API.get(`/enums/skills`);
    }

    static async getEnumsCourses () {
        return API.get(`/enums/courses`);
    }

    static async getEnumsFaculties () {
        return API.get(`/enums/faculties`);
    }

    static async getEnumsSex () {
        return API.get(`/enums/sex`);
    }

}