"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { CabRouteDao } from "@modules/v1/route";

let Schema = mongoose.Schema;

export interface ICabRoute extends mongoose.Document {
	routeName: string;
	tripType: number;
	status: string;
	createdBy: object;
	created: number;
	adminType: number;
	companyCode: string;
	employees: Empaddroute;
}

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
	// Added gender - Shivakumar A
	gender: { type: String },
	weekOff: { type: [Number] },
});

let cabRouteSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Cab data
	grpId: { type: Number },
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
	bounds: {
		northeast: {
			lat: { type: Number },
			long: { type: Number }
		},
		southwest: {
			lat: { type: Number },
			long: { type: Number }
		}
	},
	startLocation: { type: String },
	endLocation: { type: String },
	totalTripTime: { type: Number },
	routeName: { type: String, trim: true, index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	companyCode: { type: String },
	employees: [empAdd],
	tripType: {
		type: Number,
		enum: [
			config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
			config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME,
		],
		default: config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE
	},
	routeBadge: { type: String, default: "" },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.APPROVED,
			config.CONSTANT.STATUS.UN_APPROVED,
			config.CONSTANT.STATUS.DELETED,
			config.CONSTANT.STATUS.EXECUTED,
		],
		default: config.CONSTANT.STATUS.UN_APPROVED,
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

cabRouteSchema.set("toObject", {
	virtuals: true
});

cabRouteSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export cab
export let cab_routes: Model<ICabRoute> = mongoose.model<ICabRoute>(config.CONSTANT.DB_MODEL_REF.ROUTE, cabRouteSchema);