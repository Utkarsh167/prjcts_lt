"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import {Model} from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import {type} from "os";
let Schema = mongoose.Schema;

export interface IEntryLog extends mongoose.Document {
    // Made fields as optional Aashiq 07/08/2020
    regNo: string;
    vehcileId?: string;
    entryType?: string;
    inTime?: number;
    outTime?: number;
    companyCode?: string;
    VehicleInfo?: VehicleInfoManual;
    createdBy?: mongoose.Schema.Types.ObjectId;
    created?: number;
}

let vehicleInfoSchema = new Schema({
    // changed from reg_no to regNo and moved to entryLog schema Aashiq 07/08/2020
    regNo: String,
    name: String,
    purposeOfVisit: String,
    estimatedParkingDuration: Number,
    visitorId: String,
    visitorIdType: String,
    contactNo: String,
    // Added company Location Name Author- Aashiq 12/08/2020
    companyLocationName: {type: String, required: true},
    // Added modal Name Author- Aashiq 19/08/2020
    modal: { type: String, trim: true, index: false },
    vehicleType: {
        type: String,
        enum: [
            config.CONSTANT.VEHICLE_TYPE.BIKE,
            config.CONSTANT.VEHICLE_TYPE.CAR,
        ]
    },
});
let entryLogSchema = new Schema({
        vehicleId: {type: mongoose.Schema.Types.ObjectId, ref: 'vehicle'},
        // removed required true as guest wont have vehicle id
        // vehcileId: {type: mongoose.Schema.Types.ObjectId, ref: 'vehicles', required: true},
        entryType: {
            type: String,
            default: config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC,
            enum: [
                config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC,
                config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL
            ]},
        inTime: {type: Date, default: Date.now()},
        outTime: {type: Date, default: null},
        companyCode: String,
        companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'comapny_details'},
        vehicleInfo: vehicleInfoSchema,
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        // changed createdBy to userId
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
        // Added Anpr data fields Aashiq - 3/09/2020
        cameraName: String,
        anprTimeStamp: String,
        eventImageURL: String,
        ocrImageURL: String,
        category: String,
        status: {
            type: String,
            default: config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED,
            enum: [
                config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED,
                config.CONSTANT.ENTRY_LOG.STATUS.BLOCKED,
                config.CONSTANT.ENTRY_LOG.STATUS.BLACKLISTED
            ]},
        createdAt: {type: Date, default: Date.now()},
        created: {type: Number, default: Date.now()},
        updatedAt: {type: Date, default: Date.now()},
    },
    {
        versionKey: false,
        timestamps: true,
});

entryLogSchema.set("toObject", {
    virtuals: true
});

// Load password virtually
entryLogSchema.virtual("password")
    .get(function () {
        return this._password;
    })
    .set(function (password) {
        this._password = password;
        let salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
        // let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
        this.hash = appUtils.encryptHashPassword(password, salt);
    });

entryLogSchema.methods.toJSON = function () {
    let object = appUtils.clean(this.toObject());
    return object;
};

// Export entry_log
export let entry_log: Model<IEntryLog> = mongoose.model<IEntryLog>(config.CONSTANT.DB_MODEL_REF.ENTRY_LOG, entryLogSchema);
