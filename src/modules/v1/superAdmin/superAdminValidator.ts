"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateAddCompany = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	companyCode: fieldsValidator.companyCode,
	contactNumber: fieldsValidator.contactNumber,
	companyType: Joi.string().trim().required().description("Company type"),
	// companyBranch: Joi.string().trim().required().description("companyBranch"),
	totalEmp: Joi.number().allow("").optional("totel number of employee"),
	planeId: Joi.string().trim().required("Plan id"),
	paymentType: fieldsValidator.paymentType,
	serverType: fieldsValidator.serverType,
	longitude: fieldsValidator.longitude,
	latitude: fieldsValidator.latitude,
	url: Joi.string().trim().optional().allow("").description("Base url of api"),
	maxGroupRadius: Joi.number().required().description("max service range of cab"),
}).unknown();

let validateEditCompany = Joi.object({
	name: fieldsValidator.name["minlength"],
	companyCode: fieldsValidator.companyCode,
	contactNumber: fieldsValidator.contactNumber,
	companyType: Joi.string().trim().required().description("Company type"),
	// companyBranch: Joi.string().trim().required().description("companyBranch"),
	totalEmp: Joi.number().allow("").optional("totel number of employee"),
	// planeId: Joi.string().trim().required("Plan id"),
	paymentType: fieldsValidator.paymentType,
	serverType: fieldsValidator.serverType,
	longitude: fieldsValidator.longitude,
	latitude: fieldsValidator.latitude,
	userId: fieldsValidator.userId,
	url: Joi.string().trim().required().description("Base url of api"),
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
	email: fieldsValidator.email["required"],
}).unknown();
let validateIsCompanyUnique = Joi.object({
	companyCode: fieldsValidator.companyCode,
}).unknown();
let validateIsSubscriptionUnique = Joi.object({
	name: fieldsValidator.name["minlength"],
}).unknown();
let validateCompanyType = Joi.object({
	companyType: fieldsValidator.companyCode,
}).unknown();

let validateCompanyList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name, companyCode, companyCode"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "companyCode").optional().description("name, created,companyCode"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	companyType: fieldsValidator.companyType,
}).unknown();
let validateEarningList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by company name"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("company name", "created").optional().description("company name, created"),
	sortOrder: fieldsValidator.sortOrder,
	// status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();
let validateSubscriptionList = Joi.object({
	// pageNo: fieldsValidator.pageNo,
	// limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "price", "gracePeriod").optional().description("name, created,gracePeriod,gracePeriod"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	type: Joi.string().optional().allow("").description("all subscription with block")
}).unknown();
let validateSubscribedUserList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	subscriptionId: fieldsValidator.subscriptionId,
	searchKey: Joi.string().optional().description("Search by name or email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "price", "gracePeriod").optional().description("name, created,gracePeriod,gracePeriod"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	// fromDate: fieldsValidator.fromDate,
	// toDate: fieldsValidator.toDate,
}).unknown();
let validateAddSubscription = Joi.object({
	name: fieldsValidator.name["minlength"],
	price: Joi.number().required().description("subscription price"),
	description: Joi.string().required().trim().description("subscription description"),
	gracePeriod: Joi.number().required().description("plan gracePeriod"),
	year: Joi.number().description("number of year plan"),
	month: Joi.number().description("number of month plan"),
}).unknown();
let validateEditSubscription = Joi.object({
	subscriptionId: fieldsValidator.subscriptionId,
	name: fieldsValidator.name["minlength"],
	price: Joi.number().required().description("subscription price"),
	description: Joi.string().required().trim().description("subscription description"),
	gracePeriod: Joi.number().required().description("plan gracePeriod"),
	year: Joi.number().description("number of year plan"),
	month: Joi.number().description("number of month plan"),
}).unknown();
let validateDashboardCompany = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name, companyCode, companyCode"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "companyCode").optional().description("name, created,companyCode"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	duration: fieldsValidator.duration["optional"],
}).unknown();
export {
	validateEditSubscription,
	validateAddCompany,
	validateEditAdmin,
	validateForgotPassword,
	validateLogin,
	validateChangePassword,
	validateEditProfile,
	validateCompanyList,
	validateEditCompany,
	validateAddSubscription,
	validateSubscriptionList,
	validateIsCompanyUnique,
	validateCompanyType,
	validateEarningList,
	validateSubscribedUserList,
	validateDashboardCompany,
	validateIsSubscriptionUnique
};