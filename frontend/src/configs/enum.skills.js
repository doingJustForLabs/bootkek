import EnumsService from "services/enums.service.js";

export const SKILLS_OPTIONS = EnumsService.getEnumsSkills().then(response => response.data.enums);