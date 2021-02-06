"use strict";

import * as Joi from "joi";
import * as config from "@config/index";
import { fieldsValidator } from "@utils/fieldsValidator";

let validateShiftRequest = Joi.object({
	employeeId: Joi.string().trim().required(),
	shiftName: Joi.string().optional(),
	validFrom: fieldsValidator.validFrom.required(),
	validTill: fieldsValidator.validTill.required(),
	weekOff : Joi.array().required().label("Company weekOff"),
}).unknown();

let validateShiftRequestList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by employeeId, shiftName"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("validFrom", "created").optional().description("shiftName, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: Joi.string().trim().lowercase({ force: true }).optional().valid([config.CONSTANT.REQUEST_STATUS.REQUESTED, config.CONSTANT.REQUEST_STATUS.EXPIRED]).description("Status => 'requested', 'expired'"),
	shiftName: Joi.string().optional().allow("").label("Shift Name"),
}).unknown();

let validateBulkShiftRequest = Joi.object({
	file: Joi.any()
		.meta({ swaggerType: "file" })
		.required()
		.description("file exprension .xlsx|.xls").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
}).unknown();

let validateUpdatedGroupList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by routeBadge, shiftName"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("shiftName", "created").optional().description("validFrom, created"),
	sortOrder: fieldsValidator.sortOrder,
	// status: Joi.string().trim().lowercase({ force: true }).optional().valid([config.CONSTANT.STATUS.APPROVED, config.CONSTANT.STATUS.UN_APPROVED]).description("Status => 'approved', 'unapproved'"),
}).unknown();

let validateRosterUpdate = Joi.object({
	groups: Joi.array().items(Joi.string()).optional().description('Group id for approval.')
}).unknown();

let validateDeleteShiftRequest = Joi.object({
	shiftRequestId: Joi.string()
}).unknown();

export {
	validateShiftRequest,
	validateShiftRequestList,
	validateBulkShiftRequest,
	validateUpdatedGroupList,
	validateRosterUpdate,
	validateDeleteShiftRequest
};