"use strict";

import {entryLogController} from "@modules/v1/entryLog/entryLogController";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import {ResponseHandler} from "@utils/ResponseHandler";
import * as appUtils from "@utils/appUtils";
import * as entryLogValidator from "@modules/v1/entryLog/entryLogValidator";

let responseHandler = new ResponseHandler();

export let entryLogRoute = [
    {
        method: "POST",
        path: `/plate`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            // let tokenData: TokenData = request.auth.credentials.tokenData;
            let query: any = {};
            query = request.payload;
            try {
                let result: any = {};
                if (query.cameraName === "ANPR_IN") {
                    result = await entryLogController.getvehicledetails(query);
                } else if (query.cameraName === "ANPR_OUT") {
                    // result.message = "reached here";
                    result = await entryLogController.vehicleOut(query);
                }
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "EntryLog"],
            description: "Getting vehicle details using vehicle register number",
            // notes: "",
            // auth: {
            //     strategies: ["AdminAuth"]
            // },
            validate: {
                // headers: commonValidator.userAuthorizationHeaderObj,
                // query: commonValidator.validateRegNo,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/entryLog/manualEntry`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let payload: EntryLog = request.payload;
            try {
                let result = await entryLogController.manualEntry({...payload}, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "EntryLog"],
            description: "Manual entry_log using vehicle register number",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                // query: commonValidator.validateUserId,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    // {
    //     method: "PUT",
    //     path: `${config.SERVER.API_BASE_URL}/entryLog/vehicle_out`,
    //     handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    //         let tokenData: TokenData = request.auth.credentials.tokenData;
    //         let payload: EntryLog = request.payload;
    //         try {
    //             let result = await entryLogController.vehicleOut({...tokenData, ...payload});
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "EntryLog"],
    //         description: "Update outTime for entry_log using vehicle register number",
    //         // notes: "",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: commonValidator.adminAuthorizationHeaderObj,
    //             // query: commonValidator.validateUserId,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 // payloadType: 'form',
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },
    {
        method: "PUT",
        path: `${config.SERVER.API_BASE_URL}/entryLog/edit`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let payload: EntryLogId = request.payload;
            try {
                let result = await entryLogController.updateEntryLog({...payload}, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "EntryLog"],
            description: "Update entry_log details using entryLog id",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                // query: commonValidator.validateUserId,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/entryLog/list`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let query: ListingRequest = request.query;
            try {
                let result = await entryLogController.entryLogList({ ...tokenData, ...query });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Entry Logs List",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                query: entryLogValidator.validateUserList,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/entryLog/getUsers/count`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let query: ListingRequest = request.query;
            try {
                let result = await entryLogController.getUsersCount({ ...query }, {...tokenData});
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Get Entry Log Based Users Count",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                query: entryLogValidator.validateEntryLogList,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/entryLog/details/{entryLogId}`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let params: EntryLogId = request.params;
            try {
                let result = await entryLogController.entryLogDetails({ ...params, ...tokenData});
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Entry Log Details",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                params: commonValidator.validateEntryLogId,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    // {
    //     method: "GET",
    //     // path: `${config.SERVER.API_BASE_URL}/entryLog/testEventApi`,
    //     path: `/plate`,
    //     handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    //         // let tokenData: TokenData = request.auth.credentials.tokenData;
    //         // let params: EntryLogId = request.params;
    //         try {
    //             let result = await entryLogController.testEventApi(request.payload);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "user"],
    //         description: "Entry Log Details",
    //         // notes: "",
    //         // auth: {
    //         //     strategies: ["AdminAuth"]
    //         // },
    //         validate: {
    //             // headers: commonValidator.adminAuthorizationHeaderObj,
    //             // params: commonValidator.validateEntryLogId,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 // payloadType: 'form',
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/entryLog/inOutData`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let query: ListingRequest = request.query;
            try {
                let result = await entryLogController.getInOutCount({ ...query }, {...tokenData});
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Get Entry Log Based Users Count",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                query: entryLogValidator.validateEntryLogList,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    // get entry log history -- satyam
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/entryLog/userEntryLogHistory`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            // let query: ListingRequest = request.query;
            try {
                let result = await entryLogController.userEntryLogHistory(tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Get History Entry Log list for android user",
            // notes: "",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                // query: entryLogValidator.validateEntryLogList,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/entryLog/getReportsEntryData`,
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            let tokenData: TokenData = request.auth.credentials.tokenData;
            let payload: ReportsEntryData = request.payload;
            try {
                let result = await entryLogController.getReportsEntryData( {...payload }, {...tokenData});
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "user"],
            description: "Get Reports Entry Data",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: commonValidator.adminAuthorizationHeaderObj,
                query: entryLogValidator.validateReportsEntryData,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
];
