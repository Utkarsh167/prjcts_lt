"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let userAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of user"),
	platform: fieldsValidator.platform["optional"]
}).unknown();

let adminAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of admin"),
	platform: fieldsValidator.platform["optional"]
}).unknown();

let commonAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of admin or user"),
	platform: fieldsValidator.platform["required"]
}).unknown();

let platformHeaderObj = {
	"required": Joi.object({
		platform: fieldsValidator.platform["required"]
	}).unknown(),

	"optional": Joi.object({
		platform: fieldsValidator.platform["required"]
	}).unknown()
};

let validateAccessToken = Joi.object({
	accessToken: fieldsValidator.accessToken
}).unknown();

let validateChangeForgotPassword = Joi.object({
	password: fieldsValidator.password["required"]
}).unknown();

let validateRefreshToken = Joi.object({
	refreshToken: fieldsValidator.refreshToken["optional"]
}).unknown();

let validateContentView = Joi.object({
	type: fieldsValidator.type["required"]
}).unknown();

let validateStatus = Joi.object({
	status: fieldsValidator.status["required"]
}).unknown();

let validateContentId = Joi.object({
	contentId: fieldsValidator.contentId
}).unknown();

let validateNotificationId = Joi.object({
	notificationId: fieldsValidator.notificationId
}).unknown();

let validateUserId = Joi.object({
	userId: fieldsValidator.userId
}).unknown();

let validateRegNo = Joi.object({
	regNo: fieldsValidator.registrationNo1
}).unknown();

let validateEntryLogId = Joi.object({
	entryLogId: fieldsValidator.userId
}).unknown();
let validateVehicleId = Joi.object({
	vehicleId: fieldsValidator.userId
}).unknown();
let validateEmpId = Joi.object({
	empId: fieldsValidator.employeeId
}).unknown();
let validateSubscriptionId = Joi.object({
	subscriptionId: fieldsValidator.subscriptionId
}).unknown();
let validateSosId = Joi.object({
	sosId: fieldsValidator.sosId
}).unknown();
let validateRequestId = Joi.object({
	requestId: fieldsValidator.sosId
}).unknown();
let validateCabId = Joi.object({
	cabId: fieldsValidator.cabId
}).unknown();
let validateRouteId = Joi.object({
	routeId: fieldsValidator.routeId
}).unknown();

let validateVersionId = Joi.object({
	versionId: fieldsValidator.versionId
}).unknown();
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
	address: Joi.string().trim().optional().allow("").description("address"),
	// companyId: Joi.string().trim().required().description("companyId"),
	createdBy: fieldsValidator.userId,
}).unknown();
let validateBookingSlot = Joi.object({
	spot_id: fieldsValidator.spot_id,
	bookingRequestedAt: fieldsValidator.bookingRequestedAt,
	floorName: fieldsValidator.floorName,
	zoneName: fieldsValidator.zoneName
}).unknown();
export {
	validateAddCompany,
	userAuthorizationHeaderObj,
	adminAuthorizationHeaderObj,
	commonAuthorizationHeaderObj,
	platformHeaderObj,
	validateAccessToken,
	validateChangeForgotPassword,
	validateRefreshToken,
	validateContentView,
	validateStatus,
	validateContentId,
	validateNotificationId,
	validateUserId,
	validateVehicleId,
	validateCabId,
	validateRouteId,
	validateVersionId,
	validateSosId,
	validateSubscriptionId,
	validateRequestId,
	validateEmpId,
	validateEntryLogId,
	validateRegNo,
	validateBookingSlot,
};
