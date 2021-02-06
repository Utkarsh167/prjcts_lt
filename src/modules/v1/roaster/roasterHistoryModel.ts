"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ObjectId } from "bson";

let Schema = mongoose.Schema;

export interface IRoasterHistory extends mongoose.Document {
	driverId: ObjectId;
	empId: ObjectId;
	status: number;
	created: number;
	routeId: ObjectId;
	cabId: ObjectId;
	roasterId: ObjectId;
	pickupStatus: number;
	tripType: number;
}

let roasterHistorySchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Roaster history data
	created: { type: Number, default: Date.now() },
	empId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user', index: true },
	driverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user', index: true },
	routeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'cab_route', index: true },
	roasterId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'roaster', index: true },
	cabId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'cab', index: true },
	noShowReason: { type: String, trim: true, default: "" },
	pickupStatus: {
		type: Number,
		enum: [
			config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
			config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
			config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
			config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
			config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE,
			config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
			config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD
		],
		default: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
		index: true,
	},
	tripType: {
		type: Number,
		enum: [
			config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
			config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME,
		],
		default: config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE
	},
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

	}
}, {
		versionKey: false,
		timestamps: true
	});

roasterHistorySchema.set("toObject", {
	virtuals: true
});

roasterHistorySchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export cab
export let roaster_histories: Model<IRoasterHistory> = mongoose.model<IRoasterHistory>(config.CONSTANT.DB_MODEL_REF.ROASTER_HISTORY, roasterHistorySchema);