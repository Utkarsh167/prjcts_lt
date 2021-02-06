"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateSos = Joi.object({
	latitude: fieldsValidator.latitude,
	longitude: fieldsValidator.longitude,
	rosterId: fieldsValidator.rosterId,
}).unknown();
let validateSosList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name, email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.sosStatus["optional"],
	userType: fieldsValidator.userType,
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();

export {
	validateSos,
	validateSosList,
};