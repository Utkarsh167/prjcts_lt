"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IVehicle extends mongoose.Document {
	userId: mongoose.Schema.Types.ObjectId;
	regNo: string;
	companyId: mongoose.Schema.Types.ObjectId;
	modal?: string;
	vehicleType: string;
	status: string;
	createdBy: mongoose.Schema.Types.ObjectId;
	created: number;
}

let vehicleSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	regNo: { type: String, trim: true, default: "" },
	companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'company_details' },
	// Removed default option Aashiq - 3/9/2020
	vehicleType: {
		type: String,
		enum: [
			config.CONSTANT.VEHICLE_TYPE.CAR,
			config.CONSTANT.VEHICLE_TYPE.BIKE,
		],
		// default: config.CONSTANT.GENDER.OTHER
	},
	modal: { type: String, trim: true, index: false },
	userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
	created: { type: Number, default: Date.now() },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED,
		index: true,
		sparse: true
	},
}, {
	versionKey: false,
	timestamps: true
});

vehicleSchema.set("toObject", {
	virtuals: true
});

vehicleSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export user
export let vehicles: Model<IVehicle> = mongoose.model<IVehicle>(config.CONSTANT.DB_MODEL_REF.VEHICLE, vehicleSchema);