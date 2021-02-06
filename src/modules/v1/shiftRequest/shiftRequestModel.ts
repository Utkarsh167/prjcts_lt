"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ShiftRequestDao } from "@modules/v1/shiftRequest";

let Schema = mongoose.Schema;

export interface IShiftRequest extends mongoose.Document {
	cabRouteId: string;
}

let shiftRequestSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	employeeId: { type: String },
	name: { type: String },
	email: { type: String },
	// Added gender - Shivakumar A
	gender: { type: String },
	// cabRouteId: { type: mongoose.Types.ObjectId, ref: config.CONSTANT.DB_MODEL_REF.ROUTE },
	shiftName: { type: String },
	weekOff: [{ type: Number}],
	validFrom: { type: Number },
	validTill: { type: Number },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	companyCode: { type: String },
	status: {
		type: String,
		enum: [
			config.CONSTANT.REQUEST_STATUS.EXPIRED,
			config.CONSTANT.REQUEST_STATUS.CURRENT,
			config.CONSTANT.REQUEST_STATUS.REQUESTED,
			config.CONSTANT.REQUEST_STATUS.DELETED
		],
		default: config.CONSTANT.REQUEST_STATUS.REQUESTED,
		index: true,
		sparse: true

	},
}, {
		versionKey: false,
		timestamps: true
	});

shiftRequestSchema.set("toObject", {
	virtuals: true
});

shiftRequestSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export shiftRequest
export let shift_request: Model<IShiftRequest> = mongoose.model<IShiftRequest>(config.CONSTANT.DB_MODEL_REF.SHIFT_REQUEST, shiftRequestSchema);