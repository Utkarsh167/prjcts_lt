"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as config from "@config/constant";
import * as appUtils from "@utils/appUtils";

let Schema = mongoose.Schema;

export interface IAdminNotification extends mongoose.Document {
	image: string;
	title: string;
	link: string;
	message: string;
	platform: string;
	fromDate: number;
	toDate: number;
	companyCode: string;
}

let adminNotificationSchema = new Schema({
	image: { type: String, trim: true },
	title: { type: String, trim: true, index: true, required: true },
	link: { type: String, required: false },
	message: { type: String, required: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId },
	companyCode: { type: String },
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
	audience: {
		type: String,
		enum: [
			config.CONSTANT.NOTIFICATION_AUDIENCE.ALL,
			config.CONSTANT.NOTIFICATION_AUDIENCE.DRIVER,
			config.CONSTANT.NOTIFICATION_AUDIENCE.EMPLOYEE,
			config.CONSTANT.NOTIFICATION_AUDIENCE.ADMIN
		]
	},
	scheduleTime: { type: Number },
	scheduleType: {
		type: String,
		enum: [
			config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_LATER,
			config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_NOW,
		]
	},
	adminType: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
			config.CONSTANT.ADMIN_TYPE.ADMIN,
			config.CONSTANT.ADMIN_TYPE.SUB_ADMIN
		]
	},
	platform: {
		type: String,
		required: false,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.ALL,
			config.CONSTANT.DEVICE_TYPE.WEB,
		]
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