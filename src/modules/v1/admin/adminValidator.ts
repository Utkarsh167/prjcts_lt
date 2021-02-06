"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateAddAdmin = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	// password: fieldsValidator.password["required"],
	permission: fieldsValidator.permission
}).unknown();

let validateSubAdminList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by Name, email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	// Added from and toDate validations Aashiq -27/08/2020
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	companyLocationName: Joi.string().optional().description("company Location name"),
}).unknown();
let validateDashboardList = Joi.object({
	shiftType: fieldsValidator.shiftDasboardType,
	// tripRange: fieldsValidator.tripRange
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate
}).unknown();

let validateEditAdmin = Joi.object({
	name: fieldsValidator.name["minlength"],
	// email: fieldsValidator.email["required"],
	userId: fieldsValidator.userId,
	// password: fieldsValidator.password["optional-!default"],
	permission: fieldsValidator.permission
}).unknown();

let validateForgotPassword = Joi.object({
	email: fieldsValidator.email["required"]
}).unknown();

let validateLogin = Joi.object({
	email: fieldsValidator.email["required"],
	password: fieldsValidator.password["required-!pattern"],
	deviceToken: fieldsValidator.deviceToken,
	// userType: fieldsValidator.userType,
	deviceId: fieldsValidator.deviceId,
}).unknown();

let validateChangePassword = Joi.object({
	oldPassword: fieldsValidator.oldPassword,
	password: fieldsValidator.password["required"]
}).unknown();

let validateEditProfile = Joi.object({
	name: fieldsValidator.name["minlength"].optional(),
	// email: fieldsValidator.email["required"],
	crfLimitMonth: Joi.number().optional().description("Employee number of reschedule requested in one month"),
	shiftSlot: fieldsValidator.shiftTime.required(),
	address: fieldsValidator.dropupAddress.required(),
	longitude: fieldsValidator.dropofflong.required(),
	latitude: fieldsValidator.dropofflat.required(),
}).unknown();
let validatePermission = Joi.object({
	moduleName: fieldsValidator.moduleName,
}).unknown();
let validateShiftName = Joi.object({
	shiftName: Joi.string().required(),
}).unknown();

let validateAuditLogList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	// searchKey: Joi.string().optional().description("Search by Name, email"),
	// sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	// sortOrder: fieldsValidator.sortOrder,
	// status: fieldsValidator.status["optional"]
}).unknown();

export {
	validateAddAdmin,
	validateSubAdminList,
	validateEditAdmin,
	validateForgotPassword,
	validateLogin,
	validateChangePassword,
	validateEditProfile,
	validatePermission,
	validateShiftName,
	validateDashboardList,
	validateAuditLogList
};
