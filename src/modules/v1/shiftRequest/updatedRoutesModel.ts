"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ShiftRequestDao } from "@modules/v1/shiftRequest";

let Schema = mongoose.Schema;

export interface IUpdatedRoutes extends mongoose.Document {
	routeName: string;
	tripType: number;
	status: string;
	createdBy: object;
	created: number;
	adminType: number;
	companyCode: string;
	employees: Empaddroute;
}
// employee schema -- satyam
let empAdd = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	empId: { type: String },
	employeeId: { type: String, trim: true, index: true },
	empLocation: {
		lat: { type: Number },
		long: { type: Number }
	},
	empOrder: { type: Number },
	empETA: { type: Number },
	empPickupTime: { type: String },
	empDropTime: { type: String },
	status: { type: Number, required: false },
	name: { type: String, trim: true, index: true },
	countryCode: { type: String },
	mobileNo: { type: String },
	address: { type: String },
	gender: { type: String },
	weekOff: { type: [Number] },
});

let updatedRoutesSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Cab data
    grpId: { type: Number },
    grpDbId: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	empCount: { type: Number },
	shiftName: { type: String },
	shiftTime: { type: String },
	shiftType: {
		type: String,
		enum: ['login', 'logout']
	},
	grpCentre: {
		lat: { type: Number },
		long: { type: Number }
	},
	route: {
		points: { type: String }
	},
	// bounds: {
	// 	northeast: {
	// 		lat: { type: Number },
	// 		long: { type: Number }
	// 	},
	// 	southwest: {
	// 		lat: { type: Number },
	// 		long: { type: Number }
	// 	}
	// },
	// employee schema -- satyam
	employees: [empAdd],
	startLocation: { type: String },
	endLocation: { type: String },
	totalTripTime: { type: Number },
	// routeName: { type: String, trim: true, index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	companyCode: { type: String },
	// tripType: {
	// 	type: Number,
	// 	enum: [
	// 		config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
	// 		config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME,
	// 	],
	// 	default: config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE
	// },
	routeBadge: { type: String, default: "" },
	// Added routeName - Shivakumar A
	routeName: { type: String, default: "" },

	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.UN_EXECUTED,
			config.CONSTANT.STATUS.EXECUTED,
		],
		default: config.CONSTANT.STATUS.UN_EXECUTED,
		index: true,
		sparse: true

	},
	maxGroupSize: { type: Number, default: 0 },
	waitTime: { type: Number, default: 0 },
	maxTripDuration: { type: Number, default: 0 }
}, {
		versionKey: false,
		timestamps: true
	});

updatedRoutesSchema.set("toObject", {
	virtuals: true
});

updatedRoutesSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export cab
export let updated_routes: Model<IUpdatedRoutes> = mongoose.model<IUpdatedRoutes>(config.CONSTANT.DB_MODEL_REF.UPDATED_ROUTES, updatedRoutesSchema);