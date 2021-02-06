"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateAlgoData = Joi.object({
	maxGroupSize: Joi.number().required(),
	waitTime: Joi.number().required().description('In minutes'),
	maxTripDuration: Joi.number().required().description('In minutes'),
	officeLocation: Joi.object({
		lat: Joi.number().required(),
		long: Joi.number().required()
	}).required(),
	employees: Joi.array().items(Joi.object().required().keys({
		empId: Joi.string().required(),
		shift: Joi.string().required().description('Shift name'),
		shiftStartTime: Joi.string().required().description('In 24 hr format'),
		shiftEndTime: Joi.string().required().description('In 24 hr format'),
		weekOff: Joi.array().required().description('Week off days in array'),
		location: Joi.object({
			lat: Joi.number().required(),
			long: Joi.number().required()
		}).required().description("Employee's home location."),
		name: Joi.string().required(),
		employeeId: Joi.string().required(),
		countryCode: Joi.string(),
		mobileNo: Joi.string(),
		address: Joi.string(),
		// Added gender validator - Shivakumar A
		gender: Joi.string()
	})),

}).unknown();

let validateRoutingData = Joi.object({
	waitTime: Joi.number().required().description('In minutes'),
	maxTripDuration: Joi.number().required().description('In minutes'),
	officeLocation: Joi.object({
		lat: Joi.number().required(),
		long: Joi.number().required()
	}).required(),
	groups: Joi.array().items(Joi.object().required().keys({
		grpDbId: Joi.string().optional(),
		grpId: Joi.number().required(),
		empCount: Joi.number().required(),
		grpCentre: Joi.object({
			lat: Joi.number().required(),
			long: Joi.number().required()
		}),
		maxGroupSize: Joi.number().required(),
		waitTime: Joi.number().required().description('In minutes'),
		maxTripDuration: Joi.number().required().description('In minutes'),
		shiftName: Joi.string().required(),
		shiftType: Joi.string().required(),
		shiftTime: Joi.string().required(),
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
		    // Added gender validator - Shivakumar A
			gender: Joi.string()
		})),
		optimize: Joi.boolean().optional()
	}))
}).unknown();

let validateAlgoRegenerateData = Joi.object({
	maxGroupSize: Joi.number().required(),
	waitTime: Joi.number().required().description('In minutes'),
	maxTripDuration: Joi.number().required().description('In minutes'),

	officeLocation: Joi.object({
		lat: Joi.number().required(),
		long: Joi.number().required()
	}).required(),
	employees: Joi.array().items(Joi.object().required().keys({
		empId: Joi.string().required(),
		shiftName: Joi.string().required(),
		shiftTime: Joi.string().required(),
		shiftType: Joi.string().required(),
		weekOff: Joi.array().required().description('Week off days in array'),
		location: Joi.object({
			lat: Joi.number().required(),
			long: Joi.number().required()
		}).required().description("Employee's home location."),
		name: Joi.string().required(),
		employeeId: Joi.string().required(),
		countryCode: Joi.string(),
		mobileNo: Joi.string(),
		address: Joi.string(),
		// Added gender validator - Shivakumar A
		gender: Joi.string()
	})),

}).unknown();

export {
	validateAlgoData,
	validateRoutingData,
	validateAlgoRegenerateData
};