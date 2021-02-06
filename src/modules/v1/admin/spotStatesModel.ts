"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

// Model file to add company details Utkarsh 06/07/2020
export interface ISpotStates extends mongoose.Document {
    spot_id: String;
    camera_id: String;
    occupied: Boolean;
    event_start: number;
    duration: number;
    vehicle_id: String;
    companyLocationName: String;
    floorName: String;
    timeStamp: Number;
}

let spotStatesSchema = new Schema({
	spot_id: {type: String, required: true},
    camera_id: {type: String, required: true},
    occupied: {type: Boolean, required: true},
    event_start: {type: Number},
    duration: {type: Number},
    vehicle_id: {type: String},
    companyLocationName: {type: String, required: true},
    floorName: {type: String, required: true},
    timeStamp: {type: String, required: true}
}, {
		versionKey: false,
		timestamps: true,
	});

// spotStatesSchema.set("toObject", {
// 	virtuals: true
// });

spotStatesSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export companyDetails
export let spot_states: Model<ISpotStates> = mongoose.model<ISpotStates>(config.CONSTANT.DB_MODEL_REF.SPOT_STATES, spotStatesSchema);
