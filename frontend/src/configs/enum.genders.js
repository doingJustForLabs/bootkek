import EnumsService from "services/enums.service.js";

export const GENDER_OPTIONS = EnumsService.getEnumsSex().then(response => response.data.enums);