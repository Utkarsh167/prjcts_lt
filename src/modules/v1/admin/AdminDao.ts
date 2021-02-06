"use strict";

import * as _ from "lodash";
import {Model} from "mongoose";

import * as appUtils from "@utils/appUtils";
import {BaseDao} from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";
import * as adminConstant from "@modules/v1/admin/adminConstant";
import {AuditLogDao} from "@modules/v1/auditLog/AuditLogDao";
import * as moment from "moment";
import * as promise from "bluebird";

let auditLogDao = new AuditLogDao();

export class AdminDao extends BaseDao {

    public admin: Model<models.IAdmin> = models.users;
    public audiLog: Model<models.IAuditLog> = models.audit_logs;

    /**
     * @function isEmailExists
     */
    async isEmailExists(params) {
        try {
            let query: any = {};
            query.email = params.email;
            if (params.userId) {
                query._id = {
                    "$not": {
                        "$eq": params.userId
                    }
                };
            }
            query.status = {"$ne": config.CONSTANT.STATUS.DELETED};
            // Admin type check removed as new admin type is super Utkarsh 07/07/2020
            // query.type = { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };

            return await this.findOne("users", query, {}, {});
        } catch (error) {
            throw error;
        }
    }

     /**
     * @function isEmailExistForLogin
     * Author Utkarsh Patil 06/11/2020
     */
    async isEmailExistForLogin(params) {
        try {

            let aggPipe = [];

            // added company data in login api
                        let lookup = {
                "from": "company_details",
                "localField": "companyId",
                "foreignField": "_id",
                "as": "company_details"
            };

            aggPipe.push({ "$lookup": lookup });
            aggPipe.push({ "$unwind": "$company_details"});

            let query: any = {};
            query.email = params.email;
            if (params.userId) {
                query._id = {
                    "$not": {
                        "$eq": params.userId
                    }
                };
            }
            query.status = {"$ne": config.CONSTANT.STATUS.DELETED};

            aggPipe.push({ "$match": query });

            // Admin type check removed as new admin type is super Utkarsh 07/07/2020
            // query.type = { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };
            return await this.aggregate("users", aggPipe, {});
    } catch (error) {
        throw error;
    }
    }

    /**
     * @function isEmployeeIdAlreadyExists
     * @param params employeeId
     */
    async isEmployeeIdAlreadyExists(params: EmpSignupRequest) {
        let query: any = {};
        query.employeeId = params.employeeId;
        query.status = {"$ne": config.CONSTANT.STATUS.DELETED};
        let projection: any = {};
        let options: any = {};
        let isExist = await this.findOne("users_new", query, projection, options);
        if (isExist) {
            return Promise.reject(adminConstant.MESSAGES.ERROR.EMPLOYEE_ID_ALREADY_EXIST);
        } else {
            return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
        }
    }

    /**
     * @function Empsignup
     */
    async empSignup(params: EmpSignupRequest) {
        params.createdAt = new Date().getTime();
        return await this.save("users", params);
    }

    /**
     * @function isEmpEmailAlreadyExists
     * @param params email
     */
    async isEmpEmailAlreadyExists(params: EmpSignupRequest) {

        let query: any = {};

        query.email = params.email;
        query.status = {"$ne": config.CONSTANT.STATUS.DELETED};

        let projection: any = {};

        let options: any = {};

        let isExist = await this.findOne("users_new", query, projection, options);

        if (isExist) {
            return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
        } else {
            return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
        }
    }

    /**
     * @function findAdminById
     */
    // async findAdminById(params: TokenData) {
    //     try {
    //         let query: any = {};
    //         query._id = params.userId;
    //         query.status = {"$ne": config.CONSTANT.STATUS.BLOCKED};
    //         let userData: any = {};
    //         let result: any = {};
    //         let projection = {loginAttempts: 0, accessToken: 0};
    //         userData = await this.findOne("users", query, projection, {});
    //         let companyData = await this.findOne('company_details', {_id: userData.companyId}, {name: 1, code: 1, address: 1, config: 1}, {});
    //         result = {};
    //         result.userData = userData;
    //         result.companyData = companyData;
    //         // console.log(companyData);
    //         return result;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async findAdminById(params: TokenData) {
        try {
            let query: any = {};
            query._id = params.userId;
            query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
            let projection = { loginAttempts: 0, accessToken: 0 };
            return await this.findOne("users", query, projection, {});
        } catch (error) {
            throw error;
        }
    }

    async findAdminByCreatedBy(params: TokenData) {
        try {
            let query: any = {};
            query._id = params.createdBy;
            query.status = {"$ne": config.CONSTANT.STATUS.DELETED};
            let projection = {crfLimitMonth: 1};
            return await this.findOne("users", query, projection, {});
        } catch (error) {
            throw error;
        }
    }
    async findAdminByIdForAuth(params: TokenData) {
        try {
            let query: any = {};
            query._id = params.userId;
            // query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
            let projection = { loginAttempts: 0, accessToken: 0 };
            return await this.findOne("users", query, projection, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function findAdminByCompanyCode
     */
    async findAdminByCompanyCode(params: TokenData) {
        try {
            let query: any = {};
            query.compantId = params.companyId;
            query.status = {"$ne": config.CONSTANT.STATUS.DELETED};
            let projection = {loginAttempts: 0, accessToken: 0};
            return await this.find("users", query, projection, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function addRouteConf
     */
    // async addRouteConf(params: RoutingAlgoRequest) {
    // 	try {
    // 		let query: any = {};
    // 		query._id = params.userId;

    // 		let update = {};
    // 		update["$set"] = {
    // 			routeConf: {
    // 				maxGroupSize: params.maxGroupSize,
    // 				waitTime: params.waitTime,
    // 				maxTripDuration: params.maxTripDuration
    // 			}
    // 		};
    // 		return await this.updateOne("users", query, update, {});
    // 	} catch (error) {
    // 		throw error;
    // 	}
    // }

    /**
     * @function getPermission
     */
    async getPermission(params: TokenData) {
        try {
            let query: any = {};
            query.status = {"$ne": config.CONSTANT.STATUS.DELETED};

            let projection = {};

            return await this.findOne("permissions", query, projection, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function findSubAdminById
     */
    async findSubAdminById(params: TokenData) {
    	try {
    		let query: any = {};
    		query._id = params.subAdminId;
    		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

    		let projection = { _id: 1, name: 1, email: 1, created: 1, status: 1, permission: 1, companyLocationName: 1 };

    		return await this.findOne("users", query, projection, {});
    	} catch (error) {
    		throw error;
    	}
    }
    /**
     * @function createAdmin
     */
    async createAdmin(params: CreateAdminRequest) {
        try {
            return await this.save("users", params);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function createCompany
     */
    async createCompanyDetails(params: CreateCompanyDetailsRequest) {
        try {
            return await this.save("company_details", params);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function createPermission
     */
    async createPermission(params: Permission) {
        try {
            return await this.save("permissions", params);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function createDefaultPermission
     * @param params modile name module key first time running on insert
     */
    async createDefaultPermission(params) {
        try {
            return await this.save("permissions", params);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function subAdminList
     */
    async subAdminList(params: ListingRequest) {
        try {
            // compLocationName -- satyam
            let {pageNo, limit, searchKey, sortBy, sortOrder, status, isArchived, fromDate, toDate, compLocationName} = params;
            let aggPipe = [];

            let match1: any = {};
            // match1.type = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
            // match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            if (isArchived){
                match1 = {
                    "$and": [{"status": {"$eq": config.CONSTANT.STATUS.DELETED}}, {"type": {"$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN}},
                        {"_id": {"$ne": appUtils.toObjectId(params.userId)}}, {"companyId": {"$eq": appUtils.toObjectId(params.companyId)}}]
                };
            } else {
                match1 = {
                    "$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"type": {"$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN}},
                        {"_id": {"$ne": appUtils.toObjectId(params.userId)}}, {"companyId": {"$eq": appUtils.toObjectId(params.companyId)}}]
                };
            }
            aggPipe.push({"$match": match1});
            // Added match cond for companyLocationName - Aashiq - 28/08/2020
            let matchLocName: any = {};
            // complocationName --satyam
            if (compLocationName){
                matchLocName.companyLocationName = compLocationName;
                aggPipe.push({"$match": matchLocName});
            }
            if (searchKey) {
                let match2 = {};
                match2["$or"] = [
                    {"name": {"$regex": searchKey, "$options": "-i"}},
                    {"email": {"$regex": searchKey, "$options": "-i"}}
                ];
                aggPipe.push({"$match": match2});
            }

            // aggPipe.push({"$addFields": {created: {"$subtract": ["$createdAt", new Date("1970-01-01")]}}});

            // Added fromDate and Todate filter cond Aashiq - 27/08/2020
            if (status) {
                let match3: any = {};
                match3.status = {"$eq": status};
                aggPipe.push({"$match": match3});
            }
            let match4: any = {};
            if (fromDate && !toDate) {
                match4.created = {"$gte": fromDate};
                aggPipe.push({"$match": match4});
            }
            let match5: any = {};
            if (toDate && !fromDate) {
                match5.created = {"$lte": toDate};
                aggPipe.push({"$match": match5});
            }

            let match6: any = {};
            if (fromDate && toDate) {
                match6.created = {"$gte": fromDate, "$lte": toDate};
                aggPipe.push({"$match": match6});
            }

            let project = {_id: 1, totalCount: {"$size": "$permission"}, name: 1, email: 1, created: 1, status: 1, companyLocationName: 1 };
            aggPipe.push({"$project": project});

            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "name") {
                    sort = {"name": sortOrder};
                } else {
                    sort = {"created": sortOrder};
                }
            } else if (isArchived) {
                sort = {"updatedAt": -1};
            }else {
                sort = {"created": -1};
            }
            aggPipe.push({"$sort": sort});

            return await appUtils.paginate(this.admin, aggPipe, limit, pageNo);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function deleteSubAdmin
     */
    async deleteSubAdmin(params: UserId) {
        try {
            let query: any = {};
            query._id = params.userId;

            let update = {};
            update["$set"] = {
                "status": config.CONSTANT.STATUS.DELETED
            };
            // return await this.updateOne("users", query, update, {});
            return await this.findOneAndUpdate("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function editSubAdmin
     */
    async editSubAdmin(params: EditSubAdminRequest) {
        try {
            params.permission = params.permission ? params.permission : [];
            let query: any = {};
            query._id = params.userId;

            let set = {};
            let update = {};
            update["$set"] = set;

            let fieldsToFill = ["name", "permission", "totalCount", "companyLocationName"];
            set = appUtils.setInsertObject(params, set, fieldsToFill);

            let query1: any = {};
            query1.userId = params.userId;
            query1.isLogin = true;

            let update1 = {};
            update1["$set"] = {
                isLogin: false,
                lastLogout: Date.now()
            };
            update1["$unset"] = {deviceToken: "", arn: "", refreshToken: ""};

            let options1: any = {multi: true};

            await this.updateMany("login_histories", query1, update1, options1);
            return await this.findOneAndUpdate("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function blockUnblock
     */
    async blockUnblock(params: BlockRequest) {
        try {
            let query: any = {};
            query._id = params.userId;

            let update = {};
            update["$set"] = {
                status: params.status
            };

            return await this.findOneAndUpdate("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function changePassword
     */
    async changePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
        try {
            let query: any = {};
            query._id = params.userId;
            let userData = await this.isTokenExist(params);
            if (userData.forgetToken) {
                // EMPTY THE TOKEN
                let update = {};
                update["$set"] = {
                    "hash": params.hash,
                    "forgetToken": "",
                };
                let query1: any = {};
                query1.userId = params.userId;
                query1.isLogin = true;

                let update1 = {};
                update1["$set"] = {
                    isLogin: false,
                    lastLogout: Date.now()
                };
                update1["$unset"] = {deviceToken: "", arn: "", refreshToken: ""};

                let options1: any = {multi: true};

                await this.updateMany("login_histories", query1, update1, options1);
                return await this.updateOne("users", query, update, {});
            } else {
                return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function adminChangePassword
     * @param params
     */
    async adminChangePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
        try {
            let query: any = {};
            query._id = params.userId;
            let update = {};
            update["$set"] = {
                "hash": params.hash,
            };
            return await this.updateOne("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateLoginHistory
     */
    async updateLoginHistory(params) {
        try {
            let query: any = {};
            query._id = params.userId;

            let set = {};
            let update = {};
            update["$set"] = set;

            let fieldsToFill = ["isLogin", "lastLogin", "loginAttempts"];

            params = _.extend(params, {isLogin: true, lastLogin: Date.now()});
            set = appUtils.setInsertObject(params, set, fieldsToFill);

            update["$addToSet"] = {
                loginAttempts: [{
                    "remoteAddress": params.remoteAddress,
                    "platform": params.platform
                }]
            };

            return await this.updateOne("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function logout
     */
    async logout(params: TokenData) {
        try {
            let query: any = {};
            query._id = params.userId;

            let update = {};
            update["$set"] = {
                "isLogin": false,
                "lastLogout": Date.now()
            };

            return await this.update("users", query, update, {});
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function editProfile
     */
    async editProfile(params: EditProfileRequest) {
        try {
            let query: any = {};
            query._id = params.userId;
            let query1: any = {};
            query1.createdBy = params.userId;
            let query2: any = {};
            query2.createdBy = params.userId;
            // query2["driverMapped._id"] = { "$ne": "" };
            let update = {};
            let update1: any = {};
            let update2: any = {};
            let location: any = {};
            location.address = params.address;
            location.coordinates = [params.longitude, params.latitude];
            update["$set"] = {
                "name": params.name,
                // "email": params.email,
                // "shiftSlot": params.shiftSlot,
                // "companyAddress": location,
                // "isProfileComplete": true,
                // "crfLimitMonth": params.crfLimitMonth,
            };
            update1['$set'] = {
                dropoff: location
            };
            // let companyAddress: any = {};
            // companyAddress.companyLocation = location;
            update2['$set'] = {
                "driverMapped.$[].companyLocation": location
            };
            let options = {};

            // ------------Updating shift for all users - sub users of a company --------------------
            let query3: any = {};
            query3.companyId = params.companyId;
            if (params.shiftSlot.length > 0) {
                update2['$set'] = {
                    "shiftSlot": params.shiftSlot,
                    "companyAddress": location,
                    "crfLimitMonth": params.crfLimitMonth,
                    "isProfileComplete": true,
                };
            } else {
                update2['$set'] = {
                    "shiftSlot": params.shiftSlot,
                    "companyAddress": location,
                    "crfLimitMonth": params.crfLimitMonth,
                    "isProfileComplete": false,
                };
            }
            let step1 = await this.updateMany("users", query3, update2, options);
            step1.moduleName = "ADMIN, SUBADMIN";
            step1.message = params.type + " " + params.name + " " + "updated company profile setting";
            let step4 = await auditLogDao.addLog(step1, params, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
            // ------------------------------------------------------------------------------------------

            let step2 = this.updateMany("users_new", query1, update1, options);
            let setep3 = this.updateMany("cabs", query2, update2, options);
            return await this.findOneAndUpdate("users", query, update, options);

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function dashboard
     * @param params adminId
     */
    async dashboard(params: ListingRequest) {
        let aggPipe = [];
        let sdt = moment().startOf('day').subtract({'hours': 5, 'minutes': 30});
        let edt = moment().endOf('day').format('x');
        let todatDate = sdt.toDate();
        let endDate = moment(sdt).endOf('day').toDate();

        let match1: any = {};
        match1 = {"$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]};
        aggPipe.push({"$match": match1});
        let match2: any = {};
        match2 = {
            // "$or": [{ "$and": [{ "status": { "$eq": config.CONSTANT.REQUEST_STATUS.CURRENT } }, { "companyId": { "$eq": params.companyId } }] },
            // { "$and": [{ "status": { "$eq": config.CONSTANT.REQUEST_STATUS.REQUESTED } }, { "companyId": { "$eq": params.companyId } }] }]
            "$and": [{"status": {"$eq": config.CONSTANT.REQUEST_STATUS.REQUESTED}}, {"companyId": {"$eq": params.companyId}}, {"createdAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]
        };
        let match3: any = {};
        match3 = {"$and": [{"status": {"$eq": config.CONSTANT.STATUS.EXECUTED}}, {"companyId": {"$eq": params.companyId}}, {"updatedAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]};
        let match4: any = {};
        match4 = {"$and": [{"status": {"$eq": config.CONSTANT.STATUS.UN_EXECUTED}}, {"companyId": {"$eq": params.companyId}}, {"createdAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]};

        let response: any = {};

        let empOnboardOffboard = this.dashboardEmpTracking(params);
        // let employeeOnboard = tripHistory;
        let requestPipeline = [
            {
                "$match": {
                    "$and": [
                        {"companyId": {"$eq": params.companyId}}]
                }
            },
            {"$group": {_id: "$status", count: {$sum: 1}}}
        ];
        let userPipline = [
            {
                "$facet": {
                    "driverUnassign": [
                        {
                            "$match": {
                                "$or": [{"$and": [{"cab": {"$exists": false}}, {"userType": {"$eq": config.CONSTANT.USER_TYPE.DRIVER}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]},
                                    {"$and": [{"cab.0": {"$exists": false}}, {"userType": {"$eq": config.CONSTANT.USER_TYPE.DRIVER}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]}]
                            }
                        },
                        {"$count": "driverUnassign"},
                    ],
                    "driverAssign": [
                        {
                            "$match": {
                                "$and": [{"userType": {"$eq": config.CONSTANT.USER_TYPE.DRIVER}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                                    {"companyId": {"$eq": params.companyId}}, {"cab": {"$exists": true}}, {"cab.0": {"$exists": true}}]
                            }
                        },
                        {"$count": "driverAssign"}
                    ],
                    "totalDriver": [
                        {"$match": {"$and": [{"userType": {"$eq": config.CONSTANT.USER_TYPE.DRIVER}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]}},
                        {"$count": "totalDriver"}
                    ],
                    "totalEmployee": [
                        {"$match": {"$and": [{"userType": {"$eq": config.CONSTANT.USER_TYPE.EMPLOYEE}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]}},
                        {"$count": "totalEmployee"}
                    ]
                }
            },
            {
                "$project": {
                    "driverUnassign": {"$arrayElemAt": ["$driverUnassign.driverUnassign", 0]},
                    "driverAssign": {"$arrayElemAt": ["$driverAssign.driverAssign", 0]},
                    "totalDriver": {"$arrayElemAt": ["$totalDriver.totalDriver", 0]},
                    "totalEmployee": {"$arrayElemAt": ["$totalEmployee.totalEmployee", 0]}
                }
            }
        ];
        let cabPipline = [
            {
                "$facet": {
                    "cabUnassign": [
                        {
                            "$match": {
                                // "$or": [{ "$and": [{ "driverMapped": { "$exists": false } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyId": { "$eq": params.companyId } }] },
                                "$and": [{"$or": [{"busySlots": {"$exists": false}}, {"busySlots.0": {"$exists": false}}]}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]
                                // { "$and": [{ "cab.0": { "$exists": false } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyId": { "$eq": params.companyId } }] }]
                            }
                        },
                        {"$count": "cabUnassign"},
                    ],
                    "cabAssign": [
                        {
                            "$match": {
                                "$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                                    // { "companyId": { "$eq": params.companyId } }, { "driverMapped": { "$exists": true } }, { "driverMapped.0": { "$exists": true } }]
                                    {"companyId": {"$eq": params.companyId}}, {"busySlots": {"$exists": true}}, {"busySlots.0": {"$exists": true}}]
                            }
                        },
                        {"$count": "cabAssign"}
                    ],
                    "totalCab": [
                        {"$match": {"$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]}},
                        {"$count": "totalCab"}
                    ],
                }
            },
            {
                "$project": {
                    "cabUnassign": {"$arrayElemAt": ["$cabUnassign.cabUnassign", 0]},
                    "cabAssign": {"$arrayElemAt": ["$cabAssign.cabAssign", 0]},
                    "totalCab": {"$arrayElemAt": ["$totalCab.totalCab", 0]},
                }
            }
        ];
        let routePipline = [
            {
                "$facet": {
                    "routePending": [
                        {
                            "$match": {
                                "$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                                    {"companyId": {"$eq": params.companyId}}, {"status": {"$eq": config.CONSTANT.STATUS.UN_APPROVED}}]
                            }
                        },
                        {"$count": "routePending"},
                    ],
                    "routeApproved": [
                        {
                            "$match": {
                                "$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                                    {"companyId": {"$eq": params.companyId}}, {"$or": [{"status": {"$eq": config.CONSTANT.STATUS.APPROVED}}, {"status": {"$eq": config.CONSTANT.STATUS.EXECUTED}}]}]
                            }
                        },
                        {"$count": "routeApproved"}
                    ],
                    "totalRoute": [
                        {"$match": {"$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}]}},
                        {"$count": "totalRoute"}
                    ],
                    "totalOccupancy": [{$match: {"companyId": {"$eq": params.companyId}}},
                        {"$group": {"_id": {}, "totalSeat": {"$sum": '$maxGroupSize'}, "totalOccupied": {"$sum": '$empCount'}}},
                        {
                            "$project": {
                                "totalOccupancy": {
                                    "$concat": [{"$substr": [{"$multiply": [{"$divide": ["$totalOccupied", '$totalSeat']}, 100]}, 0, 2]}, "", "%"]
                                }
                            }
                        }
                    ],
                }
            },
            {
                "$project": {
                    "routePending": {"$arrayElemAt": ["$routePending.routePending", 0]},
                    "routeApproved": {"$arrayElemAt": ["$routeApproved.routeApproved", 0]},
                    "totalRoute": {"$arrayElemAt": ["$totalRoute.totalRoute", 0]},
                    "totalOccupancy": {"$arrayElemAt": ["$totalOccupancy.totalOccupancy", 0]},
                }
            }
        ];
        let sosPipline = [
            {
                "$facet": {
                    "sosCatered": [
                        {
                            "$match": {
                                "$and": [
                                    {"companyId": {"$eq": params.companyId}}, {"status": {"$eq": config.CONSTANT.USER_QUERY_STATUS.RESOLVED}}, {"updatedAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]
                            }
                        },
                        {"$count": "sosCatered"},
                    ],
                    "sosPending": [
                        {
                            "$match": {
                                "$and": [
                                    {"companyId": {"$eq": params.companyId}}, {"status": {"$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING}}, {"createdAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]
                            }
                        },
                        {"$count": "sosPending"}
                    ],
                    "totalSos": [
                        {"$match": {"$and": [{"status": {"$ne": config.CONSTANT.STATUS.DELETED}}, {"companyId": {"$eq": params.companyId}}, {"createdAt": {$gte: new Date().setUTCHours(0, 0, 0)}}]}},
                        {"$count": "totalSos"}
                    ],
                }
            },
            {
                "$project": {
                    "sosCatered": {"$arrayElemAt": ["$sosCatered.sosCatered", 0]},
                    "sosPending": {"$arrayElemAt": ["$sosPending.sosPending", 0]},
                    "totalSos": {"$arrayElemAt": ["$totalSos.totalSos", 0]},
                }
            }
        ];
        // start of the day - Shivakumar A
        // let currentDate = moment().startOf("day");
        let currentDate = moment().startOf("day").subtract({'hours': 5, 'minutes': 30});
        let sDate = Date.parse(currentDate.toString());

        // end of the day - Shivakumar A
        // let currentDate2 = moment().endOf("day");
        let currentDate2 = moment().endOf("day").subtract({'hours': 5, 'minutes': 30});
        let eDate = Date.parse(currentDate2.toString());

        let tripPipline = [
            {
                "$facet": {
                    "tripCompleted": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rideMissed, rosterdate check - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {"rideCompleted": {"$eq": true}}, {"rideMissed": {"$eq": false}}, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripCompleted"},
                    ],
                    "tripOngoing": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rosterdate check - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": true}}, {"rideCompleted": {"$eq": false}}, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripOngoing"}
                    ],
                    "tripScheduled": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rosterdate check - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {"rideCompleted": {"$eq": false}}, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripScheduled"}
                    ],
                    "tripLoginCount": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rosterdate check - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {"rideCompleted": {"$eq": true}, "route.shiftType": {"$eq": config.CONSTANT.SHIFT_TYPE.LOGIN}}, {
                                        "rosterDate": {
                                            "$gte": sDate,
                                            "$lt": eDate
                                        }
                                    }]
                            }
                        },
                        {"$count": "tripLoginCount"}
                    ],
                    "tripLoginOnTimeCount": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rosterDate for current day - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {
                                        "rideCompleted": {"$eq": true}, "route.shiftType": {"$eq": config.CONSTANT.SHIFT_TYPE.LOGIN},
                                        "onTime": {"$eq": true}
                                    }, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripLoginOnTimeCount"}
                    ],
                    // Added tripMissed, totalTrips, tripCompletedOnTime count - Shivakumar - A
                    "tripMissed": [
                        {
                            "$match": {
                                "$and": [
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {"rideCompleted": {"$eq": true}}, {"rideMissed": {"$eq": true}}, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripMissed"},
                    ],
                    "totalTrips": [
                        {
                            "$match": {
                                "$and": [
                                    {"companyId": {"$eq": params.companyId}}, {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "totalTrips"},
                    ],
                    "tripCompletedOnTime": [
                        {
                            "$match": {
                                "$and": [
                                    // Added rideMissed, rosterdate check - Shivakumar A
                                    {"companyId": {"$eq": params.companyId}}, {"rideStarted": {"$eq": false}}, {"rideCompleted": {"$eq": true}}, {"rideMissed": {"$eq": false}}, {"onTime": {"$eq": true}},
                                    {"rosterDate": {"$gte": sDate, "$lt": eDate}}]
                            }
                        },
                        {"$count": "tripCompletedOnTime"},
                    ],
                }
            },
            {
                "$project": {
                    "tripCompleted": {"$arrayElemAt": ["$tripCompleted.tripCompleted", 0]},
                    "tripOngoing": {"$arrayElemAt": ["$tripOngoing.tripOngoing", 0]},
                    // Added Missed & Total count - Shivakumar A
                    "tripMissed": {"$arrayElemAt": ["$tripMissed.tripMissed", 0]},
                    "totalTrips": {"$arrayElemAt": ["$totalTrips.totalTrips", 0]},
                    "tripCompletedOnTime": {"$arrayElemAt": ["$tripCompletedOnTime.tripCompletedOnTime", 0]},
                    "tripScheduled": {"$arrayElemAt": ["$tripScheduled.tripScheduled", 0]},
                    "totalOnTime": {"$concat": [{"$substr": [{"$divide": [{"$multiply": [{"$arrayElemAt": ["$tripLoginOnTimeCount.tripLoginOnTimeCount", 0]}, 100]}, {"$arrayElemAt": ["$tripLoginCount.tripLoginCount", 0]}]}, 0, 2]}, "", "%"]}
                }
            }
        ];
        let vendorPipeline = [
            {
                "$match": {
                    "$and": [
                        {"companyId": {"$eq": params.companyId}}]
                }
            },
            {"$group": {"_id": {"vendorId": "$cab.vendor._id", "vendoName": "$cab.vendor.name"}, count: {$sum: 1}}}
        ];

        // get todays date - Shivakumar A
        // let startofDay = moment().startOf('day').format('x');
        let startofDay = moment().startOf('day').subtract({'hours': 5, 'minutes': 30}).format('x');
        let startdate = parseInt(startofDay);
        // shiftOnTimePipeline - Shivakumar A
        let shiftOnTimePipeline = [{
            "$facet": {
                "tripOnTime": [{
                    "$match": {
                        "$and": [
                            {"companyId": {"$eq": params.companyId}}, {"onTime": {"$eq": true}}, {"rosterDate": {"$eq": startdate}}]
                    }
                },
                    {"$group": {"_id": {"shiftName": "$route.shiftName", "onTime": "$onTime"}, count: {$sum: 1}}}],
                "totalTripCount": [{
                    "$match": {
                        "$and": [
                            {"companyId": {"$eq": params.companyId}}, {"rosterDate": {"$eq": startdate}}]
                    }
                }, {"$group": {"_id": {"shiftName": "$route.shiftName"}, count: {$sum: 1}}}]
            }
        }];
        // Added onTimeData - Shivakumar A
        let onTimeData = this.aggregate("roasters", shiftOnTimePipeline, {});
        let usersData = this.aggregate("users_new", userPipline, {});
        let cabData = this.aggregate("cabs", cabPipline, {});
        let routeData = this.aggregate("cab_routes", routePipline, {});
        let sosData = this.aggregate("user_querys", sosPipline, {});
        let tripData = this.aggregate("roasters", tripPipline, {});
        let totalvendors = this.count('vendors', {...match1});
        let crPending1 = this.count('shift_request', {...match2});
        let crPending2 = this.count('updated_routes', {...match4});
        let crApproved = this.count('updated_routes', {...match3});
        // let shiftRequests = this.aggregate("shift_request", requestPipeline, {});
        let vendorData = this.aggregate("roasters", vendorPipeline, {});
        // Added onTimeData to response -  Shivakumar A
        response = Promise.all([usersData, cabData, totalvendors, crPending1, routeData, sosData, tripData, vendorData, empOnboardOffboard, crApproved, crPending2, onTimeData]);
        return response;

    }

    /**
     * @function dashboardTripHistory
     * @param params triptype triprange
     */
    async dashboardTripHistory(params: ListingRequest) {
        let aggPipe = [];
        let startDate;
        let endDate;

        startDate = params.fromDate;
        endDate = params.toDate;
        let dateArray = [];
        let currentDate = moment(startDate).startOf('day').subtract({'hours': 5, 'minutes': 30});
        let stopDate = moment(endDate);
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        let response: any = {};
        let tripCancelPipeline;
        let tripReschedulePipeline;
        if (params.shiftType) {
            tripCancelPipeline = [
                {$project: {"rosterDate": 1, "companyId": 1, "route.shiftType": 1, "route.employees.pickupStatus": 1, "status": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1}},
                {$unwind: "$route.employees"},
                {
                    "$match": {
                        "$and": [{"rosterDate": {"$gt": startDate, "$lte": endDate}}, {"route.shiftType": {"$eq": params.shiftType}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                            {"companyId": {"$eq": params.companyId}}, {"route.employees.pickupStatus": {"$eq": config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED}}]
                    }
                },
                {$project: {day: {$substr: [{$toDate: '$rosterDate'}, 0, 10]}}},
                {
                    $group: {
                        _id: "$day",
                        count: {$sum: 1},
                        time: {$avg: {$toDate: '$rosterDate'}},
                    }
                },
                {$sort: {_id: 1}},
                {
                    $project: {
                        date: '$_id',
                        views: '$count',
                    },
                },
                {
                    $group: {
                        _id: null,
                        stats: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        stats: {
                            $map: {
                                input: dateArray,
                                as: "date",
                                in: {
                                    $let: {
                                        vars: {dateIndex: {"$indexOfArray": ["$stats._id", "$$date"]}},
                                        in: {
                                            $cond: {
                                                if: {$ne: ["$$dateIndex", -1]},
                                                then: {$arrayElemAt: ["$stats", "$$dateIndex"]},
                                                else: {_id: "$$date", date: "$$date", views: 0}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$stats"
                },
                {
                    $replaceRoot: {
                        newRoot: "$stats"
                    }
                }
            ];

            tripReschedulePipeline = [

                {$project: {"rosterDate": 1, "companyId": 1, "route.shiftType": 1, "route.employees.pickupStatus": 1, "status": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1}},
                {$unwind: "$route.employees"},
                {
                    "$match": {
                        "$and": [{"rosterDate": {"$gt": startDate, "$lte": endDate}}, {"route.shiftType": {"$eq": params.shiftType}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                            {"companyId": {"$eq": params.companyId}}, {"route.employees.pickupStatus": {"$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE}}]
                    }
                },
                {$project: {day: {$substr: [{$toDate: '$rosterDate'}, 0, 10]}}},
                {
                    $group: {
                        _id: "$day",
                        count: {$sum: 1},
                        time: {$avg: {$toDate: '$rosterDate'}},
                    }
                },
                {$sort: {_id: 1}},
                {
                    $project: {
                        date: '$_id',
                        views: '$count',
                    },
                },
                {
                    $group: {
                        _id: null,
                        stats: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        stats: {
                            $map: {
                                input: dateArray,
                                as: "date",
                                in: {
                                    $let: {
                                        vars: {dateIndex: {"$indexOfArray": ["$stats._id", "$$date"]}},
                                        in: {
                                            $cond: {
                                                if: {$ne: ["$$dateIndex", -1]},
                                                then: {$arrayElemAt: ["$stats", "$$dateIndex"]},
                                                else: {_id: "$$date", date: "$$date", views: 0}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$stats"
                },
                {
                    $replaceRoot: {
                        newRoot: "$stats"
                    }
                }
            ];
        } else {
            tripCancelPipeline = [
                {
                    "$match": {
                        "$and": [{"rosterDate": {"$gt": startDate, "$lte": endDate}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                            {"companyId": {"$eq": params.companyId}}, {"route.employees.pickupStatus": {"$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE}}]
                    }
                },
                {$project: {day: {$substr: [{$toDate: '$rosterDate'}, 0, 10]}}},
                {
                    $group: {
                        _id: "$day",
                        count: {$sum: 1},
                        time: {$avg: {$toDate: '$rosterDate'}},
                    }
                },
                {$sort: {_id: 1}},
                {
                    $project: {
                        date: '$_id',
                        views: '$count',
                    },
                },
                {
                    $group: {
                        _id: null,
                        stats: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        stats: {
                            $map: {
                                input: dateArray,
                                as: "date",
                                in: {
                                    $let: {
                                        vars: {dateIndex: {"$indexOfArray": ["$stats._id", "$$date"]}},
                                        in: {
                                            $cond: {
                                                if: {$ne: ["$$dateIndex", -1]},
                                                then: {$arrayElemAt: ["$stats", "$$dateIndex"]},
                                                else: {_id: "$$date", date: "$$date", views: 0}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$stats"
                },
                {
                    $replaceRoot: {
                        newRoot: "$stats"
                    }
                }
            ];

            tripReschedulePipeline = [
                {
                    "$match": {
                        "$and": [{"rosterDate": {"$gt": startDate, "$lte": endDate}}, {"status": {"$ne": config.CONSTANT.STATUS.DELETED}},
                            {"companyId": {"$eq": params.companyId}}, {"route.employees.pickupStatus": {"$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE}}]
                    }
                },
                {$project: {day: {$substr: [{$toDate: '$rosterDate'}, 0, 10]}}},
                {
                    $group: {
                        _id: "$day",
                        count: {$sum: 1},
                        time: {$avg: {$toDate: '$rosterDate'}},
                    }
                },
                {$sort: {_id: 1}},
                {
                    $project: {
                        date: '$_id',
                        views: '$count',
                    },
                },
                {
                    $group: {
                        _id: null,
                        stats: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        stats: {
                            $map: {
                                input: dateArray,
                                as: "date",
                                in: {
                                    $let: {
                                        vars: {dateIndex: {"$indexOfArray": ["$stats._id", "$$date"]}},
                                        in: {
                                            $cond: {
                                                if: {$ne: ["$$dateIndex", -1]},
                                                then: {$arrayElemAt: ["$stats", "$$dateIndex"]},
                                                else: {_id: "$$date", date: "$$date", views: 0}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$stats"
                },
                {
                    $replaceRoot: {
                        newRoot: "$stats"
                    }
                }
            ];
        }
        let tripCancelData = this.aggregate("roasters", tripCancelPipeline, {});
        let tripRescheduleData = this.aggregate("roasters", tripReschedulePipeline, {});
        response = Promise.all([tripCancelData, tripRescheduleData]);
        return response;

    }

    /**
     * @function dashboardEmpTracking
     * @param params triptype triprange
     */
    async dashboardEmpTracking(params: ListingRequest) {
        let aggPipe = [];
        let sdt = moment().startOf('day').subtract({'hours': 5, 'minutes': 30}).format('x');
        let startDate = parseInt(sdt);
        let response: any = {};
        let empTrackingPipline = [
            {
                "$facet": {
                    "onboardedEmployees": [
                        {$project: {"cab.registrationNo": 1, "cab.cabBadge": 1, "route.employees.pickupStatus": 1, "route.employees.employeeId": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1, "companyId": 1}},
                        {$sort: {_id: -1}},
                        {$unwind: "$route.employees"},
                        {$match: {"companyId": params.companyId, "route.employees.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED, "rideStarted": true}},
                    ],
                    "offBoardedEmployees": [
                        {$project: {"cab.registrationNo": 1, "companyId": 1, "cab.cabBadge": 1, "route.employees.pickupStatus": 1, "route.employees.employeeId": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1}},
                        {$sort: {_id: -1}},
                        {$unwind: "$route.employees"},
                        {$match: {"companyId": params.companyId, "route.employees.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD, "rideStarted": true}},
                    ]
                }
            },
        ];
        let empTrackingData = this.aggregate("roasters", empTrackingPipline, {});
        response = Promise.all([empTrackingData]);
        return response;

    }

    /**
     * @function isShiftNameAlreadyExists
     * @param params shiftName
     */
    async isShiftNameAlreadyExists(params: ShiftName) {

        let query: any = {};

        let regex = new RegExp(["^", params.shiftName, "$"].join(""), "i");
        query["shiftSlot.shiftName"] = regex;
        query.status = {"$ne": config.CONSTANT.STATUS.DELETED};
        query.companyId = {"$eq": params.companyId};

        let projection: any = {};

        let options: any = {};

        let isExist = await this.findOne("users", query, projection, options);

        if (isExist) {
            return Promise.reject(adminConstant.MESSAGES.ERROR.SHIFT_NAME_ALREADY_EXIST);
        } else {
            return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
        }
    }

    async getSingleUserDevice(params: AddAdminNotificationRequest) {
        let aggPipe = [];

        aggPipe.push({"$addFields": {created: {"$subtract": ["$createdAt", new Date("1970-01-01")]}}});

        let lookup = {
            "from": "login_histories",
            "localField": "_id",
            "foreignField": "userId",
            "as": "users"
        };
        aggPipe.push({"$lookup": lookup});

        aggPipe.push({"$unwind": "$users"});

        let project1 = {
            _id: 1, isLogin: "$users.isLogin", platform: "$users.platform", deviceId: "$users.deviceId",
            deviceToken: "$users.deviceToken", arn: "$users.arn", name: 1, gender: 1,
            created: 1, type: 1
        };
        aggPipe.push({"$project": project1});

        let match1: any = {};
        match1.isLogin = true;
        match1._id = appUtils.toObjectId(params.receiverId);
        match1.type = config.CONSTANT.ADMIN_TYPE.ADMIN;
        aggPipe.push({"$match": match1});
        return await this.aggregate("users", aggPipe, {});
    }

    /**
     * @function auditLogList
     * @param params page no limit
     */
    async auditLogList(params: ListingRequest) {
        try {
            let {pageNo, limit} = params;
            let aggPipe = [];
            let match1: any = {};
            match1 = {
                "$and": [
                    {"companyId": {"$eq": params.companyId}}]
            };
            aggPipe.push({"$match": match1});
            aggPipe.push({"$addFields": {created: {"$subtract": ["$createdAt", new Date("1970-01-01")]}}});

            let sort = {};
            sort = {"createdAt": -1};
            aggPipe.push({"$sort": sort});
            return await appUtils.paginate(this.audiLog, aggPipe, limit, pageNo);
        } catch (error) {
            throw error;
        }
    }

    // Forgot passsword toke save
    async updateForgetPassword(tokenData, accessToken) {
        let query: any = {};

        query._id = tokenData.userId;

        let update: any = {};
        update['$set'] = {
            forgetToken: accessToken
        };

        let options: any = {};

        let response = await this.update('users', query, update, options);

        return response;
    }

    async isTokenExist(userData) {
        let query: any = {};
        query._id = userData.userId;
        let projection: any = {};
        let options: any = {};
        let response = await this.findOne('users', query, projection, options);
        return response;
    }

    /**
     * @function isPermissionExist permission exist when running server
     * @param params
     */
    async isPermissionExist() {
        let query: any = {};
        query = {"$or": [{"moduleName": {"$exists": true}}, {"moduleName.0": {"$exists": true}}]};
        let projection: any = {};
        let options: any = {};
        let response = await this.findOne('permissions', query, projection, options);
        return response;
    }

    /**
     * @function createCompanyAdmin
     */
    async createCompanyAdmin(params: CreateCompanyRequest) {
        let query: any = {};
        let query1: any = {};
        let projection = {};
        // query._id = params.planeId;
        // query1._id = params.companyType;
        let location: any = {};
        location.address = params.address;
        location.coordinates = [params.longitude, params.latitude];
        params.companyBranch = location;
        params.companyAddress = location;
        let compantData: any = {};
        compantData = {
            _id: params.companyType,
            type: "software"
        };
        params.companyType = compantData;
        // if (params.companyType) {
        // 	let companyType = await this.findOne("company_types", query1, projection, {});
        // 	let compantData: any = {};
        // 	compantData = {
        // 		_id: companyType._id,
        // 		type: companyType.companyType
        // 	};
        // 	params.companyType = compantData;
        // }
        // if (params.planeId) {
        // 	let subscription = await this.findOne("subscriptions", query, projection, {});
        // 	let yearMonth = subscription.year * 12;
        // 	let totalMonth = subscription.month + yearMonth;
        // 	let CurrentDate = new Date();
        // 	let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
        // 	// params.expiryDate = expiryDate;
        // 	let newExpiry = new Date(expiryDate);
        // 	let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + subscription.gracePeriod);
        // 	// params.expiryEndDate = expiryEndDate;
        // 	params.plane = {
        // 		_id: subscription._id,
        // 		name: subscription.name,
        // 		price: subscription.price,
        // 		description: subscription.description,
        // 		gracePeriod: subscription.gracePeriod,
        // 		year: subscription.year,
        // 		month: subscription.month,
        // 		expiryDate: expiryDate,
        // 		expiryEndDate: expiryEndDate,
        // 		paymentDate: Date.now(),
        // 	};
        // 	let update = {};
        // 	update["$inc"] = {
        // 		totalSubscribers: 1,
        // 	};
        // 	await this.updateOne("subscriptions", query, update, {});
        // 	params.totalAmount = subscription.price;
        // }

        return await this.save("users", params);
    }

    /**
     * @function displaySettings displays settings for company
     * @param params
     */
    async displaySettings(params) {
        let query: any = {};
        query = {_id: appUtils.toObjectId(params.companyId)};
        let projection: any = {name: 1, code: 1, address: 1, config: 1};
        let response = await this.findOne('company_details', query, {name: 1, code: 1, address: 1, config: 1}, {});
        return response;
    }

    /**
     * @function updateSettings updates settings for company
     * @param params
     */
    async updateSettings(params, tokenData) {
        let query: any = {};
        query = {_id: tokenData.companyId};
        let update = {};
        update["$set"] = {
            config: {
                booking_status_cutoff: params.booking_status_cutoff,
                geofence_cutoff: params.geofence_cutoff,
                duration: params.duration
            }
        };
        // Inserts the config if key not found
        return await this.findOneAndUpdate('company_details', query, update, {upsert: true, new: true});
    }

    /**
     * @function displayLocations displays locations for Buildings
     * @param params
     */
    async displayLocations(params) {
        let query: any = {};
        query = {_id: params.companyId};
        let projection: any = {name: 1, code: 1, address: 1, locations: 1};
        let options: any = {};
        let response = await this.findOne('company_details', query, projection, options);
        return response;
    }
    /**
     * @function displayLocationNames displays location names for a Buildings
     * @param params
     */
    async displayLocationNames(params) {
        let aggPipe: any = [];
        aggPipe.push({$match: {_id: appUtils.toObjectId(params.companyId)}});
        aggPipe.push({$unwind: "$locations"});
        aggPipe.push({$project: {_id: "$locations._id", name: "$locations.name"}});
        let options: any = {};
        let response = await this.aggregate('company_details', aggPipe, options);
        return response;
    }
    async getUserFloors(params){
        // let aggPipe: any = [];
        // aggPipe.push({$match: {_id: appUtils.toObjectId(params.companyId)}});
        // aggPipe.push({$unwind: "$locations"});
        // aggPipe.push({$project: {_id: "$locations._id", name: "$locations.name"}});
        let query: any = {};
        query = {_id: params.companyId};
        let projection: any = {locations: {$elemMatch: { name: params.companyLocationName}}};
        let options: any = {};
        let response = await this.findOne('company_details', query, projection, options);
        return response;
        // let aggPipe: any = [];
        // aggPipe.push({$match: {_id: appUtils.toObjectId(params.companyId)}});
        // aggPipe.push({$elemMatch: {"locations.name": params.companyLocationName}});
        // // aggPipe.push({$project: {_id: "$locations._id", name: "$locations.name"}});
        // let options: any = {};
        // let response = await this.aggregate('company_details', aggPipe, options);
        // return response;
    }
    async getAllCompaniesData(){
        return await this.find("company_details", {}, {}, {});
    }
    async addSpotStates(obj){
        return await this.save("spot_states", obj);
    }
}
