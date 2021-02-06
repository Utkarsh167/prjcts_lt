"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateAddAdmin = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	password: fieldsValidator.password["required"],
	permission: fieldsValidator.permission
}).unknown();

let validateSubAdminList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by Name, email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"]
}).unknown();

let validateEditAdmin = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	password: fieldsValidator.password["optional-!default"],
	permission: fieldsValidator.permission
}).unknown();

let validateForgotPassword = Joi.object({
	email: fieldsValidator.email["required"]
}).unknown();

let validateLogin = Joi.object({
	email: fieldsValidator.email["required"],
	password: fieldsValidator.password["required-!pattern"]
}).unknown();

let validateChangePassword = Joi.object({
	oldPassword: fieldsValidator.oldPassword,
	password: fieldsValidator.password["required"]
}).unknown();

let validateEditProfile = Joi.object({
	name: fieldsValidator.name["minlength"],
	// email: fieldsValidator.email["required"],
	shiftSlot: fieldsValidator.shiftTime,
}).unknown();

export {
	validateAddAdmin,
	validateSubAdminList,
	validateEditAdmin,
	validateForgotPassword,
	validateLogin,
	validateChangePassword,
	validateEditProfile
};