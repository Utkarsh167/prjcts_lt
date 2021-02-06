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
		platform: fieldsValidator.platform["optional"]
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
let validateSubscriptionId = Joi.object({
	subscriptionId: fieldsValidator.subscriptionId
}).unknown();
let validateSosId = Joi.object({
	sosId: fieldsValidator.sosId
}).unknown();
let validateCabId = Joi.object({
	cabId: fieldsValidator.cabId
}).unknown();

let validateVersionId = Joi.object({
	versionId: fieldsValidator.versionId
}).unknown();

export {
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
	validateCabId,
	validateVersionId,
	validateSosId,
	validateSubscriptionId
};