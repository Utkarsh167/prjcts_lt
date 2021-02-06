"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as config from "@config/constant";
import * as appUtils from "@utils/appUtils";
import { WSASYSCALLFAILURE } from "constants";

let Schema = mongoose.Schema;

export interface IAdminNotification extends mongoose.Document {
	image: string;
	title: string;
	link: string;
	message: string;
	platform: string;
	fromDate: number;
	toDate: number;
}

let audienceType = new Schema({
	_id: { type: String }, // companyaddressId md5 encrypt
	name: { type: String },
	email: { type: String },
}, {
		_id: false
	});
let adminNotificationSchema = new Schema({
	image: { type: String, trim: true },
	title: { type: String, trim: true, index: true, required: true },
	link: { type: String, required: false },
	message: { type: String, required: true },
	created: { type: Number, default: Date.now() },
	adminType: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
			config.CONSTANT.ADMIN_TYPE.ADMIN,
			config.CONSTANT.ADMIN_TYPE.SUB_ADMIN
		]
	},
	audience: { type: String, default: "all" },
	targetAudience: audienceType,
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB,
			config.CONSTANT.DEVICE_TYPE.ALL
		],
		default: config.CONSTANT.DEVICE_TYPE.WEB,
	},
	fromDate: { type: Number },
	toDate: { type: Number },
	gender: {
		type: String,
		enum: [
			config.CONSTANT.GENDER.MALE,
			config.CONSTANT.GENDER.FEMALE,
			config.CONSTANT.GENDER.ALL
		]
	},
	sentCount: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

adminNotificationSchema.set("toObject", {
	virtuals: true
});

adminNotificationSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export let admin_notifications: Model<IAdminNotification> = mongoose.model<IAdminNotification>(config.CONSTANT.DB_MODEL_REF.ADMIN_NOTIFICATION, adminNotificationSchema);