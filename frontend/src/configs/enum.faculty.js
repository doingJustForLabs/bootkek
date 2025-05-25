import EnumsService from "services/enums.service.js";

export const FACULTY_OPTIONS = EnumsService.getEnumsFaculties().then(response => response.data.enums);