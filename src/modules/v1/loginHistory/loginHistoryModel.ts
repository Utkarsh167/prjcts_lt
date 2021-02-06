"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface ILoginHistory extends mongoose.Document {
	userId: mongoose.Schema.Types.ObjectId;
	salt: string;
	isLogin: boolean;
	lastLogin: number;
	lastLogout: number;
	deviceId: string;
	remoteAddress: string;
	platform: string;
	deviceToken: string;
	refreshToken: string;
	arn: string;
	zone: string;
	userType: number;
}

let loginHistorySchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER,
		required: true
	},
	salt: { type: String }, // combination of userId.timestamp.deviceId
	isLogin: { type: Boolean, default: false },
	lastLogin: { type: Number },
	lastLogout: { type: Number },
	deviceId: { type: String, required: true },
	remoteAddress: { type: String },
	companyCode: { type: String },
	created: { type: Number, default: Date.now() },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		]
	},
	deviceToken: { type: String, index: true },
	refreshToken: { type: String, index: true },
	userType: {
		type: Number,
		enum: [
			config.CONSTANT.USER_TYPE.EMPLOYEE,
			config.CONSTANT.USER_TYPE.DRIVER,
		]
	},
	arn: { type: String },
	zone: { type: String } // GMT+5:30
}, {
		versionKey: false,
		timestamps: true
	});

loginHistorySchema.set("toObject", {
	virtuals: true
});

loginHistorySchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export let login_histories: Model<ILoginHistory> = mongoose.model<ILoginHistory>(config.CONSTANT.DB_MODEL_REF.LOGIN_HISTORY, loginHistorySchema);