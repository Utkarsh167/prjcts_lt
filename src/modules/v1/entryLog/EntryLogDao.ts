"use strict";

// import * as _ from "lodash";
import { Model } from "mongoose";
import { flatten } from "mongo-dot-notation";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";
import { parse } from "ts-node";
import * as entryLogConstant from "@modules/v1/entryLog/entryLogConstant";

function getParquaryAuthData(params) {
    let config = {
        user: params.user,
        pass: params.password,
        sendImmediately: false
    };
    return config;
}
export class EntryLogDao extends BaseDao {

    async getSuperAdmin() {
        let query: any = {};
        query.type = "super";
        let response = await this.findOne("users", query, {}, {});
        return response;
    }

    async isEntryLogged(params) {
        let query: any = {};
        let aggPipeline = [];
        let date = new Date(Date.now() - 20 * 1000);
        let match1: any = {};
        if (params.cameraName === "ANPR_OUT") {
            match1.outTime = { $gte: date };
            // match2 = {$sort: {outTime: -1}};
        } else if (params.cameraName === "ANPR_IN") {
            match1.inTime = { $gte: date };
            // match2 = {$sort: {outTime: -1}};
        }
        aggPipeline.push({ "$match": match1 });
        let lookup: any = {};
        lookup = {
            from: "vehicles",
            localField: "vehicleId",
            foreignField: "_id",
            as: "vehicleData"
        };
        aggPipeline.push({ "$lookup": lookup });
        aggPipeline.push({ $unwind: { path: "$vehicleData", preserveNullAndEmptyArrays: true } });
        lookup = {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData"
        };
        aggPipeline.push({ "$lookup": lookup });
        aggPipeline.push({ $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } });
        query = { $or: [{ "vehicleData.regNo": params.regNo }, { "vehicleInfo.regNo": params.regNo }] };
        aggPipeline.push({ "$match": query });
        let match2: any = {};
        match2 = { $sort: { createdAt: -1 } };
        aggPipeline.push(match2);
        // let date = new Date(Date.now() - 300000);
        // if (params.cameraName === "ANPR_OUT") {
        //     match1.outTime = {$gte: date};
        //     // match2 = {$sort: {outTime: -1}};
        // } else if (params.cameraName === "ANPR_IN") {
        //     match1.inTime = {$gte: date};
        //     // match2 = {$sort: {outTime: -1}};
        // }
        // aggPipeline.push({"$match": match1});
        // aggPipeline.push(match2);
        // aggPipeline.push({"$match": {created: {$gt: Date.now() - 300000}}});
        aggPipeline.push({ "$limit": 1 });
        let response = await this.aggregate("entry_log", aggPipeline, {});
        return response;
    }

    async getVehicleDetails(params) {
        let query: any = {};
        let aggPipeline = [];
        query = { regNo: params.regNo };
        aggPipeline.push({ "$match": query });
        let lookup: any = {};
        lookup = {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "users"
        };
        aggPipeline.push({ "$lookup": lookup });
        // Added emptyarrays option and check for vehicle and user is in unblocked state Aashiq - 25/08/2020
        aggPipeline.push({ $unwind: { path: "$users", preserveNullAndEmptyArrays: true } });
        // aggPipeline.push({"$match": {$and: [{"status": {$eq: config.CONSTANT.STATUS.UN_BLOCKED}}, {"users.status": {$eq: config.CONSTANT.STATUS.UN_BLOCKED}}]}});
        let project: any = {};
        project = {
            vehicleId: "$_id",
            userId: 1,
            regNo: 1,
            companyId: 1,
            vehicleType: 1,
            vehicleStatus: "$status",
            userType: "$users.type",
            userStatus: "$users.status",
            email: "$users.email",
            name: "$users.name",
            contactNo: "$users.contactNo",
            guestValidity: "$users.guestValidity",
            _id: 0,
        };
        aggPipeline.push({ "$project": project });
        let response = await this.aggregate("vehicles", aggPipeline, {});
        return response[0];
    }

    async saveEntryLog(params) {
        params.createdAt = new Date().getTime();
        params.inTime = new Date().getTime();
        params.created = Date.now();
        let response = await this.save("entry_log", params);
        return response;
    }

    async vehicleOut(params) {
        let query: any = {};
        let step1 = await this.findOne("vehicles", { regNo: params.regNo }, { _id: 1 }, {});
        query.created = { $gte: new Date().getTime() - (5 * 24 * 60 * 60 * 1000) };
        if (step1) {
            query.vehicleId = step1._id;
        } else {
            query = { "vehicleInfo.regNo": params.regNo };
        }
        query.outTime = null;
        let response = await this.findOneAndUpdate("entry_log", query, { outTime: Date.now() }, { sort: { "created": -1 }, new: true });
        return response;
    }

    async updateEntryLog(params, tokenData) {
        let query: any = {};
        let response: any = {};
        if (params.vehicleData) {
            query._id = params.vehicleId;
            response = await this.findOneAndUpdate("vehicles", query, params.vehicleData, { new: true });
            // Added feature to update the guest data
            if (params.userId && params.userId !== null) {
                query._id = params.userId;
                response = await this.findOneAndUpdate("users", query, params.vehicleData, { new: true });
            }
        } else {
            // Added update object for flatten Aashiq - 3/09/2020
            let update: any = {};
            if (params.vehicleInfo) {
                update = flatten(params);
            }
            console.log(params, update);
            query._id = appUtils.toObjectId(params.entryLogId);
            response = await this.findOneAndUpdate("entry_log", query, update, { new: true });
        }
        return response;
    }
    async updateEntryLogData(query, update) {
        let response: any = {};
        response = await this.findOneAndUpdate("entry_log", query, update, { new: true });
        return response;
    }
    async entryLogList(params: ListingRequest) {
        // compLocationName - satyam
        let { pageNo, limit, searchKey, sortBy, sortOrder, fromDate, toDate, requestedPage, userType, compLocationName, status, flag } = params;
        let aggPipe = [];
        let aggPipe2 = [];

        let match1: any = {};
        match1 = { "companyId": appUtils.toObjectId(params.companyId) };
        aggPipe.push({ "$match": match1 });

        // Made Requested Page as optional Aashiq - 21/08/2020
        if (requestedPage) {
            if (requestedPage === config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC) {
                match1 = { "entryType": config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC };
            } else if (requestedPage === config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL) {
                match1 = { "entryType": config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL };
            }
            aggPipe.push({ "$match": match1 });
        }

        // Added search for regNo Aashiq - 21/08/2020
        let matchuser = { from: "users", localField: "userId", foreignField: "_id", as: "user" };
        aggPipe.push({ "$lookup": matchuser });
        aggPipe.push({ "$unwind": { path: "$user", preserveNullAndEmptyArrays: true } });

        // Added match cond for companyLocationName - Aashiq - 28/08/2020
        // companyLocation -- satyam
        if (compLocationName) {
            let matchLocName: any = {};
            matchLocName = { $or: [{ "user.companyLocationName": compLocationName }, { "vehicleInfo.companyLocationName": compLocationName }] };
            aggPipe.push({ "$match": matchLocName });
        }

        // Added search by userType Aashiq - 26/08/2020
        if (userType) {
            if (userType.toString() === '1') {
                match1 = { "user.employeeId": { $eq: null } };
            } else {
                match1 = { "user.employeeId": { $ne: null } };
            }
            aggPipe.push({ "$match": match1 });
        }
        let matchvehicle = { from: "vehicles", localField: "vehicleId", foreignField: "_id", as: "vehicleDetails" };
        aggPipe.push({ "$lookup": matchvehicle });
        aggPipe.push({ "$unwind": { path: "$vehicleDetails", preserveNullAndEmptyArrays: true } });
        // Added status filter
        if (status) {
            if (status === config.CONSTANT.STATUS.BLOCKED) {
                match1 = { "vehicleDetails.status": config.CONSTANT.STATUS.BLOCKED };
                // match1 = {$or: [{"$vehicleDetails.status": config.CONSTANT.STATUS.BLOCKED}, {"user.status": config.CONSTANT.STATUS.BLOCKED}]};
            } else {
                match1 = { "vehicleDetails.status": config.CONSTANT.STATUS.UN_BLOCKED };
            }
            aggPipe.push({ "$match": match1 });
        }
        let match2 = {};
        if (searchKey) {
            match2["$or"] = [
                { "user.name": { "$regex": searchKey, "$options": "-i" } },
                { "vehicleInfo.name": { "$regex": searchKey, "$options": "-i" } },
                { "vehicleDetails.regNo": { "$regex": searchKey, "$options": "-i" } },
                { "vehicleInfo.regNo": { "$regex": searchKey, "$options": "-i" } },
            ];
            aggPipe.push({ "$match": match2 });
        }

        let match4: any = {};
        if (fromDate && !toDate) {
            match4.created = { "$gte": fromDate };
            aggPipe.push({ "$match": match4 });
        }
        let match5: any = {};
        if (toDate && !fromDate) {
            match5.created = { "$lte": toDate };
            aggPipe.push({ "$match": match5 });
        }

        let match6: any = {};
        if (fromDate && toDate) {
            match6.created = { "$gte": fromDate, "$lte": toDate };
            aggPipe.push({ "$match": match6 });
        }
        // user type shouldnt be super -- satyam
        let match7: any = {};
        match7["user.type"] = { "$ne": "super" };
        aggPipe.push({ "$match": match7 });
        // Removed status filter Aashiq - 26/08/2020
        // let match7: any = {};
        // if (status) {
        //     match7["user.status"] = {"$eq": status};
        //     aggPipe.push({"$match": match7});
        // }
        let match8: any =  {};
        if (flag === "in"){
            match8 = { "inTime": { $ne: null } };
        } else if (flag === "out") {
            match8 = { "outTime": { $ne: null }};
        }
        aggPipe.push({ "$match": match8 });
        aggPipe2 = [...aggPipe];
        let sort = {};
        if (sortBy && sortOrder) {
            if (sortBy === "name") {
                sort = { "user.name": sortOrder, "vehicleInfo.name": sortOrder };
            } else if (sortBy === "userId") {
                sort = { "userId": sortOrder };
            } else if (sortBy === "regNo") {
                sort = { "vehicleDetails.regNo": sortOrder, "vehicleInfo.regNo": sortOrder };
            } else {
                sort = { "created": sortOrder };
            }
        } else {
            sort = { "created": -1 };
        }
        aggPipe.push({ "$sort": sort });
        if (pageNo && limit) {
            let skip = (pageNo - 1) * limit;
            aggPipe.push({ "$skip": skip });
            aggPipe.push({ "$limit": limit });
        }
        // Added vehicleDetails Aashiq - 21/08/2020
        let project = {
            vehicleDetails: 1,
            vehicleId: 1,
            entryType: 1,
            inTime: 1,
            outTime: 1,
            companyCode: 1,
            companyId: 1,
            vehicleInfo: 1,
            userId: 1,
            ocrImageURL: 1,
            eventImageURL: 1,
            name: { $cond: { if: "$user.name", then: "$user.name", else: "$vehicleInfo.name" } },
            companyLocationName: { $cond: { if: "$user.companyLocationName", then: "$user.companyLocationName", else: "$vehicleInfo.companyLocationName" } },
            userType: { $cond: { if: "$user.type", then: "$user.type", else: config.CONSTANT.USER_TYPE.GUEST } },
            email: { $cond: { if: "$user.email", then: "$user.email", else: "$vehicleInfo.email" } },
            // status: "$user.status",
            status: 1,
            created: 1,
            createdAt: 1,

            // Added validTill field Aashiq
            validTill: "$user.guestValidity"
        };
        aggPipe.push({ "$project": project });
        // Removed vehicle Details Aashiq - 21/08/2020
        // let matchVehicles = {from: "vehicles", localField: "vehicleId", foreignField: "_id", as: "vehicleDetails"};
        // aggPipe.push({"$lookup": matchVehicles});
        // let option = { collation: { locale: "en", strength: 2 } };
        let response = [];
        let entryLogList = await this.aggregate("entry_log", aggPipe, {});
        aggPipe2.push({ $group: { _id: null, count: { $sum: 1 } } });
        aggPipe2.push({ $project: { count: { $cond: { if: "$count", then: "$count", else: 0 } } } });
        let totalCount = await this.aggregate('entry_log', aggPipe2, {});
        response = [entryLogList, totalCount];
        // console.log(response);
        return response;
    }

    async userList(params: ListingRequest, tokenData) {
        // compLocation satyam
        let { fromDate, toDate, compLocationName, requestedPage } = params;
        let { companyId } = tokenData;
        let aggPipe = [];
        if (companyId) {
            aggPipe.push({ $match: { companyId: appUtils.toObjectId(companyId) } });
        }
        // Added companyLocationName and requestedPage filters Aashiq
        if (requestedPage) {
            let match1: any = {};
            if (requestedPage === config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC) {
                match1 = { "entryType": config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC };
            } else if (requestedPage === config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL) {
                match1 = { "entryType": config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL };
            }
            aggPipe.push({ "$match": match1 });
        }
        let match4: any = {};
        if (fromDate && !toDate) {
            match4.created = { $gte: fromDate };
            aggPipe.push({ "$match": match4 });
        }

        let match5: any = {};
        if (toDate && !fromDate) {
            match5.created = { "$lte": toDate };
            aggPipe.push({ "$match": match5 });
        }

        let match6: any = {};
        if (fromDate && toDate) {
            match6.created = { "$gte": fromDate, "$lte": toDate };
            aggPipe.push({ "$match": match6 });
        }
        let lookup: any = {};
        lookup = {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "users"
        };
        aggPipe.push({ $lookup: lookup });
        aggPipe.push({ $unwind: { path: "$users", preserveNullAndEmptyArrays: true } });
        // compLocation satyam
        if (compLocationName) {
            let matchLocName: any = {};
            matchLocName = { $or: [{ "users.companyLocationName": compLocationName }, { "vehicleInfo.companyLocationName": compLocationName }] };
            aggPipe.push({ "$match": matchLocName });
        }
        // user type shouldnt be super -- satyam
        let match7: any = {};
        match7["user.type"] = { "$ne": "super" };
        aggPipe.push({ "$match": match7 });
        aggPipe.push({
            $addFields: {
                userType: { $cond: { if: "$users.type", then: "$users.type", else: "reg_guests" } }
            }
        });
        // Added userType field Aashiq
        // aggPipe.push({$group: {_id: {type: "$_id.type"}, count: {$sum: 1}}});
        aggPipe.push({ $group: { _id: { type: "$userType" }, count: { $sum: 1 } } });
        let project: any = {};
        project = {
            type: { $cond: { if: "$_id.type", then: "$_id.type", else: "reg_guests" } },
            count: 1,
            _id: 0
        };
        aggPipe.push({ $project: project });
        let response = await this.aggregate("entry_log", aggPipe, {});
        return response;
    }

    /**
     * @function findEntryLogById includes vehData and userData
     */
    async findEntryLogById(params) {
        try {
            let query: any = {};
            query._id = appUtils.toObjectId(params.entryLogId);
            let aggPipe = [];
            aggPipe.push({ $match: query });
            aggPipe.push({ $limit: 1 });
            let lookup: any = {};
            lookup = {
                from: "vehicles",
                localField: "vehicleId",
                foreignField: "_id",
                as: "vehicleData"
            };
            aggPipe.push({ $lookup: lookup });
            aggPipe.push({ $unwind: { path: "$vehicleData", preserveNullAndEmptyArrays: true } });
            lookup = {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
            };
            aggPipe.push({ $lookup: lookup });
            aggPipe.push({ $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } });
            let project: any = {};
            project = {
                entryType: 1,
                _id: 1,
                inTime: 1,
                outTime: 1,
                createdAt: 1,
                updatedAt: 1,
                userId: 1,
                companyId: 1,
                vehicleId: 1,
                created: 1,
                vehicleData: {
                    _id: "$vehicleData._id",
                    userId: "$vehicleData.userId",
                    regNo: "$vehicleData.regNo",
                    companyId: "$vehicleData.companyId",
                    vehicleType: "$vehicleData.vehicleType",
                    createdBy: "$vehicleData.createdBy",
                    status: "$vehicleData.status",
                    modal: "$vehicleData.modal"
                },
                vehicleInfo: 1,
                userData: {
                    _id: "$userData._id",
                    type: "$userData.type",
                    isProfileComplete: "$userData.isProfileComplete",
                    isLogin: "$userData.isLogin",
                    created: "$userData.created",
                    permission: "$userData.permission",
                    status: "$userData.status",
                    email: "$userData.email",
                    name: "$userData.name",
                    companyId: "$userData.companyId",
                    contactNo: "$userData.contactNo",
                    createdAt: "$userData.createdAt",
                    updatedAt: "$userData.updatedAt",
                    guestValidity: "$userData.guestValidity",
                }
            };
            aggPipe.push({ $project: project });
            return await this.aggregate("entry_log", aggPipe, {});

            // return await this.findOne("entry_log", query, {}, {});
        } catch (error) {
            throw error;
        }
    }

    async aggFunc(params, flag, tokenData, validFrom?, validTill?) {
        let { compLocationName } = params;
        let { companyId } = tokenData;
        console.log("params", params);
        let aggPipe = [];
        aggPipe.push({ $match: { companyId: appUtils.toObjectId(companyId) } });
        let lookup: any = {};
        lookup = {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "users"
        };
        aggPipe.push({ $lookup: lookup });
        aggPipe.push({ $unwind: { path: "$users", preserveNullAndEmptyArrays: true } });
        if (compLocationName) {
            let matchLocName: any = {};
            matchLocName = { $or: [{ "users.companyLocationName": compLocationName }, { "vehicleInfo.companyLocationName": compLocationName }] };
            aggPipe.push({ "$match": matchLocName });
        }
        // let matchLocName: any = {};
        // matchLocName = {$or: [{"users.companyLocationName": params.companyLocationName}, {"vehicleInfo.companyLocationName": params.companyLocationName}]};
        // aggPipe.push({"$match": matchLocName});

        let match1: any = {};
        if (flag) {
            if (validFrom) {
                match1.outTime = { $gte: validFrom, $lt: validTill };
            } else {
                let fromDate = new Date(new Date().setHours(0, 0, 0, 0));
                match1.outTime = { $gte: fromDate };
            }
        } else {
            if (validFrom) {
                match1.inTime = { $gte: validFrom, $lt: validTill };
            } else {
                let fromDate = new Date(new Date().setHours(0, 0, 0, 0));
                match1.inTime = { $gte: fromDate };
            }
        }
        aggPipe.push({ "$match": match1 });
        let date = "$inTime";
        if (flag) {
            date = "$outTime";
        }
        let group: any = {};
        group = {
            _id: {
                hour: { "$hour": { date: date, timezone: "+0530" } },
            },
            count: { "$sum": 1 },
        };
        aggPipe.push({ $group: group });
        let project: any = {};
        project = {
            hour: "$_id.hour", count: 1, _id: 0
        };
        aggPipe.push({ $project: project });
        return await this.aggregate("entry_log", aggPipe, {});
    }

    async inOutCount(params, tokenData) {
        function getCounts(arr, ind) {
            let obj = arr.find(function (innerObj) {
                if (innerObj.hour === ind) {
                    return true;
                }
            });
            if (!obj) {
                obj = 0;
            } else {
                obj = obj.count;
            }
            return obj;
        }
        let response = [];
        console.log(params);
        if (params.fromDate) {
            // console.log(new Date(new Date().setHours(0, 0, 0, 0)) );
            // console.log(new Date(new Date(params.fromDate).setHours(0, 0, 0, 0)));
            // console.log(new Date(new Date(params.toDate).setHours(0, 0, 0, 0)));
            // console.log(new Date(Date.now() + 19800000));
            // console.log(Date.now() + 19800000);
            // console.log(Date.now());
            let fromDate = new Date(new Date(params.fromDate).setHours(0, 0, 0, 0));
            let toDate = new Date(new Date(params.toDate).setHours(0, 0, 0, 0));
            let validTill = new Date(new Date(params.fromDate).setHours(0, 0, 0, 0));
            while (fromDate <= toDate) {
                console.log(fromDate);
                validTill.setDate(validTill.getDate() + 1);
                let inArray = await this.aggFunc(params, false, tokenData, fromDate, validTill);
                let outArray = await this.aggFunc(params, true, tokenData, fromDate, validTill);
                console.log(inArray);
                console.log(outArray.length);
                for (let i = 0; i <= 23; i++) {
                    let obj: any = {};
                    obj.timeStamp = new Date(validTill).setUTCHours(i, 0, 0, 0);
                    console.log(obj.timeStamp);
                    obj.inCount = getCounts(inArray, i);
                    obj.outCount = getCounts(outArray, i);
                    response.push(obj);
                }
                fromDate.setDate(fromDate.getDate() + 1);
            }
        } else {
            let inArray = await this.aggFunc(params, false, tokenData);
            let outArray = await this.aggFunc(params, true, tokenData);
            console.log(inArray.length);
            console.log(outArray.length);
            for (let i = 0; i <= new Date(Date.now() + 19800000).getUTCHours(); i++) {
                let obj: any = {};
                obj.timeStamp = new Date().setUTCHours(i, 0, 0, 0);
                obj.inCount = getCounts(inArray, i);
                obj.outCount = getCounts(outArray, i);
                response.push(obj);
            }
        }
        return response;
    }
    async userEntryLogHistory(params) {
        try {
            let aggPipe: any = [];
            let match1: any = {};
            match1 = { "userId": appUtils.toObjectId(params.userId) };
            aggPipe.push({ "$match": match1 });
            let matchuser = { from: "users", localField: "userId", foreignField: "_id", as: "userData" };
            aggPipe.push({ "$lookup": matchuser });
            aggPipe.push({ "$unwind": { path: "$userData", preserveNullAndEmptyArrays: true } });
            let matchvehicle = { from: "vehicles", localField: "vehicleId", foreignField: "_id", as: "vehicleData" };
            aggPipe.push({ "$lookup": matchvehicle });
            aggPipe.push({ "$unwind": { path: "$vehicleData", preserveNullAndEmptyArrays: true } });
            let project: any = {};
            project = {
                entryType: 1,
                _id: 1,
                inTime: 1,
                outTime: 1,
                createdAt: 1,
                updatedAt: 1,
                userId: 1,
                companyId: 1,
                vehicleId: 1,
                created: 1,
                vehicleData: {
                    _id: "$vehicleData._id",
                    userId: "$vehicleData.userId",
                    regNo: "$vehicleData.regNo",
                    companyId: "$vehicleData.companyId",
                    vehicleType: "$vehicleData.vehicleType",
                    createdBy: "$vehicleData.createdBy",
                    status: "$vehicleData.status",
                    modal: "$vehicleData.modal"
                },
                vehicleInfo: 1,
                userData: {
                    _id: "$userData._id",
                    type: "$userData.type",
                    isProfileComplete: "$userData.isProfileComplete",
                    isLogin: "$userData.isLogin",
                    created: "$userData.created",
                    permission: "$userData.permission",
                    status: "$userData.status",
                    email: "$userData.email",
                    name: "$userData.name",
                    companyId: "$userData.companyId",
                    contactNo: "$userData.contactNo",
                    createdAt: "$userData.createdAt",
                    updatedAt: "$userData.updatedAt",
                    guestValidity: "$userData.guestValidity",
                }
            };
            aggPipe.push({ $project: project });
            let entryLogList = await this.aggregate("entry_log", aggPipe, {});
            return entryLogList;
        } catch (error) {
            throw error;
        }

    }
    async openBoomBarrierApi() {
        // console.log("paramsGetSnap", params);
        const request = require('request');
        // const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.get(
                {
                    url: config.CONSTANT.ANPR_CAMERA_OPEN_URL,
                    auth: config.CONSTANT.AUTH_DATA_ANPR,
                },
                function (err, httpResponse, body) {
                    // console.log("HttpResonse", httpResponse);
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log("&&&&&&&&&&&&&&&&&&&&", err, body);
                }
            );
        });
    }

    async closeBoomBarrierApi() {
        const request = require('request');

        return await new Promise(function (resolve, reject) {
            request.get(
                {
                    url: config.CONSTANT.ANPR_CAMERA_CLOSE_URL,
                    auth: config.CONSTANT.AUTH_DATA_ANPR,
                },
                function (err, httpResponse, body) {
                    // console.log("HttpResonse", httpResponse);
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log("&&&&&&&&&&&&&&&&&&&&", err, body);
                }
            );
        });
    }

    public entry_log: Model<models.IEntryLog> = models.entry_log;
}
