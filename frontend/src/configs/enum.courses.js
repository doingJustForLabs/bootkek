import EnumsService from "services/enums.service.js";

export const COURSE_OPTIONS = await EnumsService.getEnumsCourses().then(response => response.data.enums);