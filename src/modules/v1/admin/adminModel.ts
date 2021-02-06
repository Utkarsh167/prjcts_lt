"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IAdmin extends mongoose.Document {
	name?: string;
	email: string;
	salt: string;
	hash: string;
	type: string;
	profilePicture: string;
	isLogin: boolean;
	lastLogin: number;
	lastLogout: number;
	// loginAttempts: LoginAttempts;
	// shiftSlot: ShiftSlot;
	permission: Permission;
	status: string;
	// companyCode: string;
	// contactNumber: CompanyMobile;
	contactNo: string;
	// companyType: string;
	// companyBranch: string;
	// totalEmp: number;
	// plane: string;
	// paymentType: string;
	// serverType: string;
	// url: string;
	companyId: string;
	// totalAmount: number;
	// totalCount: number;
	// isProfileComplete: boolean;
	forgetToken: string;
	// routeConf: RouteConf;
}

let adminSchema = new Schema({
	// Removed Required true from name Aashiq - 3/9/2020
	// name: { type: String, trim: true, required: true },
	name: { type: String, trim: true },
	employeeId: { type: String, trim: true, required: false },
	// Changed required true for email as guests may not provide email Aashiq - 18/08/2020
	email: { type: String, trim: true, index: true, lowercase: true, required: false },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	type: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	profilePicture: { type: String },
	isProfileComplete: { type: Boolean, default: false },
	isLogin: { type: Boolean, default: false, required: true },
	lastLogin: { type: Number },
	lastLogout: { type: Number },
	contactNo: String,
	forgetToken: { type: String, required: false },
	companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'company_details', required: false },
	// Changing createdBy to false for initial insertion Utkarsh 04/07/2020
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: false },
	// createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	created: { type: Number, default: Date.now() },
	// added guest validity Aashiq 07/08/2020
	guestValidity: Date,
	// Added Purpose of visit field to record guests reason - Aashiq
	purposeOfVisit: String,
	// Added company Location Name Author- Aashiq 12/08/2020
	companyLocationName: {type: String, required: true},
	// book slot required changes -- satyam
	bookedSpot: {type: String},
	isSpotBooked: {type: Boolean, default: false},
	bookedAt: {type: Number},
	permission: [{
		type: String,
		default: [],
		enum: [
			// added dashboard key added aashiq - 17/08/2020
			config.CONSTANT.MODULE_KEY.DASHBOARD,
			// EntryLog key added aashiq - 20/08/2020
			config.CONSTANT.MODULE_KEY.ENTRY_LOG,
			// Employee Vehicle Management key added aashiq - 20/08/2020
			config.CONSTANT.MODULE_KEY.EMPLOYEE_VEHICLE_MANAGEMENT,
			config.CONSTANT.MODULE_KEY.REAL_TIME_DURATION,
			config.CONSTANT.MODULE_KEY.SUBADMIN,
			config.CONSTANT.MODULE_KEY.PROFILE,
			config.CONSTANT.MODULE_KEY.GUARD,
			// config.CONSTANT.MODULE_KEY.ROSTER,
			// config.CONSTANT.MODULE_KEY.ROUTE,
			// config.CONSTANT.MODULE_KEY.BILLING,
			// config.CONSTANT.MODULE_KEY.CAB,
			// config.CONSTANT.MODULE_KEY.DRIVER,
			// config.CONSTANT.MODULE_KEY.EMPLOYEE,
			config.CONSTANT.MODULE_KEY.NOTIFICATION,
			// config.CONSTANT.MODULE_KEY.REPORT,
			// config.CONSTANT.MODULE_KEY.REQUEST,
			// config.CONSTANT.MODULE_KEY.VENDOR,
			// config.CONSTANT.MODULE_KEY.RTLS,
			// config.CONSTANT.MODULE_KEY.TRIPHISTORY,
			config.CONSTANT.MODULE_KEY.AUDITLOG,
			// config.CONSTANT.MODULE_KEY.SHIFTMANAGEMENT,
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
	},
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
// Changed database name from admin to user Utkarsh 06/07/2020
export let users: Model<IAdmin> = mongoose.model<IAdmin>(config.CONSTANT.DB_MODEL_REF.USERS, adminSchema);
