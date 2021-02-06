"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IAdmin extends mongoose.Document {
	name: string;
	email: string;
	salt: string;
	hash: string;
	adminType: string;
	profilePicture: string;
	isLogin: boolean;
	lastLogin: number;
	lastLogout: number;
	loginAttempts: LoginAttempts;
	permission: Permission;
	status: string;
	companyCode: string;
	contactNumber: CompanyMobile;
	companyType: string;
	companyBranch: string;
	totalEmp: number;
	plane: string;
	paymentType: string;
	serverType: string;
	url: string;
	companyId: string;
	totalAmount: number;
	forgetToken: string;
}

let companyNumber = new Schema({
	phoneNumber: { type: String },
}, {
		_id: false
	});
let companyType = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId }, // companyaddressId md5 encrypt
	type: { type: String },
}, {
		_id: false
	});

let plane = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: false },
	name: { type: String },
	price: { type: Number },
	description: { type: String },
	gracePeriod: { type: Number },
	year: { type: Number, default: 0 },
	month: { type: Number, default: 0 },
	expiryDate: { type: Number, required: true, default: 0 },
	paymentDate: { type: Number, required: true, default: 0 },
	expiryEndDate: { type: Number, required: true, default: 0 },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED,
	}
}, {
		_id: true
	});

let loginAttempts = new Schema({
	remoteAddress: { type: String },
	platform: { type: String }
}, {
		_id: false
	});

// Comapany address
let dropoffSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // companyaddressId md5 encrypt
	address: { type: String, trim: true, required: true, default: "Appinventiv" },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], default: [77.35972, 28.6060803] }// [longitude, latitude]
}, {
		_id: true
	});
// Comapany Branch
let branchSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true }, // companyaddressId md5 encrypt
	address: { type: String, trim: true, required: true, default: "Appinventiv" },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], default: [77.35972, 28.6060803] }// [longitude, latitude]
}, {
		_id: true
	});

let adminSchema = new Schema({
	name: { type: String, trim: true, required: true },
	email: { type: String, trim: true, index: true, lowercase: true, required: true },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	profilePicture: { type: String },
	isLogin: { type: Boolean, default: false, required: true },
	lastLogin: { type: Number },
	lastLogout: { type: Number },
	companyAddress: dropoffSchema,
	companyCode: String,
	contactNumber: [companyNumber],
	companyType: companyType,
	companyBranch: branchSchema,
	totalEmp: { type: Number, default: 0 },
	totalAmount: { type: Number, default: 0 },
	maxGroupRadius: { type: Number, default: 0 },
	forgetToken: { type: String, required: false },
	plane: plane,
	paymentType: {
		type: String,
		enum: [
			config.CONSTANT.PAYMENT_TYPE.CARD,
			config.CONSTANT.PAYMENT_TYPE.CASH,
			config.CONSTANT.PAYMENT_TYPE.INVOICE,
		],
	},
	serverType: {
		type: String,
		enum: [
			config.CONSTANT.SERVER_TYPE.FLEET_SERVER,
			config.CONSTANT.SERVER_TYPE.IN_HOUSE
		],
	},
	url: String,
	companyId: String,
	createdBy: { type: mongoose.Schema.Types.ObjectId },
	created: { type: Number, default: Date.now() },
	loginAttempts: [loginAttempts],
	permission: [{
		type: String,
		default: [],
		enum: [
			"view_user", "send_notification_user", "block_user", "delete_user", "import_user",
			"view_content", "add_content", "delete_content", "edit_content",
			"view_notification", "add_notification", "delete_notification", "edit_notification",
			"view_version", "add_version", "delete_version", "edit_version"
		]
	}],
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED
	}
}, {
		versionKey: false,
		timestamps: true,
		// toObject: {
		// 	virtuals: true
		// },
		// toJSON: {
		// 	virtuals: true
		// },
		// toObject: {
		// 	transform: function(doc, ret){
		// 		// delete ret._id;
		// 		console.log(doc, ret, "toObject");
		// 	}
		// },
		// toJSON: {
		// 	transform: function(doc, ret){
		// 		console.log(doc, ret, "toJSON");
		// 		// delete ret._id;
		// 	}
		// }
	});

// Ensure virtual fields are serialised.
// adminSchema.set('toJSON', {
// 	virtuals: true
// });
adminSchema.set("toObject", {
	virtuals: true
});

// Load password virtually
adminSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		let salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
		// let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
		this.hash = appUtils.encryptHashPassword(password, salt);
	});

// adminSchema.set('toObject', {
// 	transform: function (doc, ret){
// 		console.log(ret);
// 	}
// });
// OR
adminSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export admin
export let admins: Model<IAdmin> = mongoose.model<IAdmin>(config.CONSTANT.DB_MODEL_REF.ADMIN, adminSchema);