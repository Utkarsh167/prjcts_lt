"use strict";

import * as Joi from "joi";
import * as config from "@config/index";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateVendorSignup = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	profilePicture: fieldsValidator.profilePicture,
}).unknown();
let validateVendorUpdate = Joi.object({
	name: fieldsValidator.name["minlength"],
	countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	profilePicture: fieldsValidator.profilePicture,
	userId: fieldsValidator.userId,
}).unknown();
let validateVendorList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name, email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "vendorId").optional().description("name, created, vendorId"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	isArchived: Joi.boolean().optional().allow("").label("isArchived true for archived user list"),
}).unknown();
let validateVendorListing = Joi.object({
	searchKey: Joi.string().optional().description("Search by name"),
}).unknown();
let validateBulkVendorSignup = Joi.object({
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

export {
	validateVendorSignup,
	validateVendorUpdate,
	validateVendorList,
	validateVendorListing,
	validateBulkVendorSignup
};