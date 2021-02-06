"use strict";

import * as Joi from "joi";
import * as config from "@config/index";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateRouteAdd = Joi.object({
	routeName: fieldsValidator.routeName,
	tripType: fieldsValidator.tripType,
	employees: fieldsValidator.employees,
}).unknown();

let validateRouteUpdate = Joi.object({
	routeId: fieldsValidator.routeId,
	routeName: Joi.string().optional().description('New name for the group.'),
	employeesToAdd: Joi.array().items(Joi.string()).optional().description('New employees to be added to the group.'),
	employeesToRemove: Joi.array().items(Joi.string()).optional().description('Old employees to be removed from the group.'),
}).unknown();

let validateRouteNameUpdate = Joi.object({
	routeId: fieldsValidator.routeId,
	routeName: Joi.string().required().description('New name for the group.'),
}).unknown();

let validateRouteList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by routeName, routeBadge"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("routeName", "created").optional().description("routeName, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: Joi.string().trim().lowercase({ force: true }).optional().valid([config.CONSTANT.STATUS.APPROVED, config.CONSTANT.STATUS.UN_APPROVED]).description("Status => 'approved', 'unapproved'"),
	shiftType: Joi.string().valid("login", "logout").optional().description("login, logout"),
	shiftName: Joi.string().optional().allow("").label("Shift Name"),
}).unknown();

let validateProcessedRouteList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by routeName, routeBadge"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("routeName", "created").optional().description("routeName, created"),
	sortOrder: fieldsValidator.sortOrder,
	// status: Joi.string().trim().lowercase({ force: true }).optional().valid([config.CONSTANT.STATUS.APPROVED, config.CONSTANT.STATUS.UN_APPROVED]).description("Status => 'approved', 'unapproved'"),
	shiftType: Joi.string().valid("login", "logout").optional().description("login, logout"),
	shiftName: Joi.string().optional().allow("").label("Shift Name"),
}).unknown();

let validateRoutingAlgo = Joi.object({
	maxGroupSize: Joi.number().required().description('Max no. of employees to assing in a group.'),
	waitTime: Joi.number().required().description('Employee wait time for pickup. In minutes.'),
	maxTripDuration: Joi.number().required().description('Maximum duration for a trip. In minutes.'),
}).unknown();

let validateRouteApproval = Joi.object({
	groups: Joi.array().items(Joi.string()).optional().description('Group id for approval.'),
	approveAll: Joi.boolean().default(false),
	approveLogin: Joi.boolean().default(false),
	approveLogout: Joi.boolean().default(false)
}).unknown();

let validateRouteDissolve = Joi.object({
	groups: Joi.array().items(Joi.string()).optional().description('Group id for approval.')
}).unknown();

let validateRouteMerge = Joi.object({
	groups: Joi.array().items(Joi.string()).optional().description('Group id for approval.')
}).unknown();

let validateRouteRegenerate = Joi.object({
	groups: Joi.array().items(Joi.string()).optional().description('Group id for approval.')
}).unknown();

let validateSwapEmpOrder = Joi.object({
	routeId: fieldsValidator.routeId,
	employees: Joi.array().items(Joi.object().required().keys({
		empId: Joi.string().required(),
		empLocation: Joi.object({
			lat: Joi.number().required(),
			long: Joi.number().required()
		}),
		weekOff: Joi.array().required().description('Week off days in array'),
		name: Joi.string().required(),
		employeeId: Joi.string().required(),
		countryCode: Joi.string(),
		mobileNo: Joi.string(),
		address: Joi.string(),
		empPickupTime: Joi.string().optional(),
		empDropTime: Joi.string().optional(),
		empOrder: Joi.number().optional(),
		empETA: Joi.number().optional(),
		// Added gender - Shivakumar A
		gender: Joi.string()
	})),
}).unknown();

export {
	validateRouteAdd,
	validateRouteUpdate,
	validateRouteList,
	validateProcessedRouteList,
	validateRoutingAlgo,
	validateRouteApproval,
	validateRouteDissolve,
	validateRouteMerge,
	validateRouteRegenerate,
	validateSwapEmpOrder,
	validateRouteNameUpdate
};