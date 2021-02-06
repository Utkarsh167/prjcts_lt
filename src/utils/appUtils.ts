"use strict";

import * as _ from "lodash";
import * as atob from "atob";
import * as bcrypt from "bcrypt";
import * as Boom from "boom";
import * as btoa from "btoa";
import * as crypto from "crypto";
import * as del from "del";
import { ExcelJs } from "../lib/ExcelJs";
import * as Hapi from "hapi";
import * as MD5 from "md5";
import * as moment from "moment";
import * as mongoose from "mongoose";
import * as randomstring from "randomstring";
import * as path from "path";
// import * as TinyURL from "tinyurl";
import * as validator from "validator";

import * as config from "@config/index";
import { logger } from "@lib/logger";
import * as GoogleDistance from "@lib/distanceMatrix";
import * as pushManager from "@lib/pushNotification/pushManager";
// import { NotificationDao } from "@modules/v1/notification/NotificationDao";

const TAG = "fleet-uploads";

// let notificationDao = new NotificationDao();

let verifyEmailFormat = function (value: string) {
	return validator.isEmail(value);
};

let setInsertObject = function (source, destination, fields) {
	_.each(fields, function (value, index) {
		if (source[value] != null) {
			destination[value] = source[value];
		}
	});

	return destination;
};

let unsetInsertObject = function (source, destination, fields) {
	_.each(fields, function (value, index) {
		if (!source[value]) {
			destination[value] = "";
		}
	});

	return destination;
};

let buildToken = function (params: TokenData) {
	let userObject: any = {};

	if (params.userId)
		userObject.userId = params.userId;
	if (params.socialLoginType)
		userObject.socialLoginType = params.socialLoginType;
	if (params.socialId)
		userObject.socialId = params.socialId;
	if (params.email)
		userObject.email = params.email;
	if (params.name)
		userObject.name = params.name;
	if (params.firstName)
		userObject.firstName = params.firstName;
	if (params.middleName)
		userObject.middleName = params.middleName;
	if (params.lastName)
		userObject.lastName = params.lastName;
	if (params.countryCode)
		userObject.countryCode = params.countryCode;
	if (params.mobileNo)
		userObject.mobileNo = params.mobileNo;
	userObject.platform = params.platform;
	if (params.deviceId)
		userObject.deviceId = params.deviceId;
	if (params.salt)
		userObject.salt = params.salt;
	userObject.accountLevel = params.accountLevel;
	if (params.adminType)
		userObject.adminType = params.adminType;
	if (params.created)
		userObject.created = params.created;
	if (params.userType)
		userObject.userType = params.userType;

	return userObject;
};

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
*/
let genRandomString = function (length) {
	return crypto.randomBytes(Math.ceil(length / 2))
		.toString("hex") /** convert to hexadecimal format */
		.slice(0, length);   /** return required number of characters */
};

let encryptHashPassword = function (password: string, salt: string) {
	return bcrypt.hashSync(password, salt);
	// let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	// hash.update(password);
	// return hash.digest('hex');
};

let toObjectId = function (_id: string): mongoose.Types.ObjectId {
	return mongoose.Types.ObjectId(_id);
};

let failActionFunction = async function (request: Hapi.Request, h: Hapi.ResponseToolkit, error: any) {
	let customErrorMessage = "";
	if (error.name === "ValidationError") {
		customErrorMessage = error.details[0].message;
	} else {
		customErrorMessage = error.output.payload.message;
	}
	customErrorMessage = customErrorMessage.replace(/"/g, "");
	customErrorMessage = customErrorMessage.replace("[", "");
	customErrorMessage = customErrorMessage.replace("]", "");
	return Boom.badRequest(customErrorMessage);
};

let convertISODateToTimestamp = function (value) {
	// 2018-12-06T07:28:14.793Z to 1545578721887
	return new Date(value).getTime();
};

Object.defineProperty(Array.prototype, "chunk_inefficient", {
	value: function (chunkSize) {
		let array = this;
		return [].concat.apply([], array.map(function (elem, i) {
			return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
		}));
	}
});

let splitArrayInToChunks = function (data) {
	return data.chunk_inefficient(config.SERVER.CHUNK_SIZE);
};

let createWebPushPayload = function (data) {
	let set: any = {};
	let fieldsToFill = ["type", "click_action", "title", "body", "link", "image", "priority", "contentType", "category"];

	data.type = data.notificationType;
	data.click_action = config.SERVER.CLICK_ACTION;
	data.priority = "high";
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	set = this.setInsertObject(data, set, fieldsToFill);

	// if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
	return set;
	// } else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
	// 	let payload = {
	// 		data: set
	// 	};
	// 	return JSON.stringify(payload);
	// }
};
let createAndroidPushPayload = function (data) {
	let set: any = {};
	let fieldsToFill = ["type", "title", "message", "link", "image", "priority", "contentType", "category"];

	data.type = data.notificationType;
	data.priority = "high";
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	set = this.setInsertObject(data, set, fieldsToFill);

	// if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
	return set;
	// } else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
	// 	let payload = {
	// 		data: set
	// 	};
	// 	return JSON.stringify(payload);
	// }
};

let createIOSPushPayload = function (data) {
	let set: any = {};
	let fieldsToFill = ["type", "title", "message", "alert", "link", "attachmentUrl", "contentType", "category", "mutableContent", "threadId", "sound"];

	data.type = data.notificationType;
	data.alert = data.title;
	data.body = data.message;
	data.attachmentUrl = data.image;
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	data.mutableContent = 1;
	data.threadId = "RichPush";
	data.sound = "default";
	set = this.setInsertObject(data, set, fieldsToFill);

	// if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
	return set;
	// } else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
	// 	let payload = {};
	// 	payload[config.CONSTANT.SNS_SERVER_TYPE.DEV] = JSON.stringify({
	// 		aps: set
	// 	});
	// 	return payload;
	// }
};

let calculateAge = function (dob) {
	// 1545578721887 to 24
	dob = new Date(dob);
	let now = new Date();
	let otherDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let years = (otherDate.getFullYear() - dob.getFullYear());

	if (otherDate.getMonth() < dob.getMonth() || otherDate.getMonth() === dob.getMonth() && otherDate.getDate() < dob.getDate()) {
		years--;
	}

	return years;
};

let convertStringToRegExp = function (value: string) {
	return new RegExp(value);
};

let convertRegExpToString = function (value) {
	return value.source;
};

let CryptDataMD5 = function (stringToCrypt: string) {
	return MD5(MD5(stringToCrypt));
};

let encodeToBase64 = function (value: string) {
	return btoa(value);
};

let decodeBase64 = function (value: string) {
	return atob(value);
};

// let tinyUrl = (url: string) => {
// 	return new Promise((resolve, reject) => {
// 		TinyURL.shorten(url, async (response) => {
// 			resolve(response);
// 		});
// 	});
// };

let getRandomOtp = function () {
	return randomstring.generate({ charset: "numeric", length: 6 });
};

let isValidEmail = function (email: string) {
	let pattern = config.CONSTANT.REGEX.EMAIL;
	return new RegExp(pattern).test(email);
};

let stringToBoolean = function (value: string) {
	switch (value.toString().toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;
		case "false":
		case "no":
		case "0":
		case null:
			return false;
		default:
			return Boolean(value);
	}
};

let stringReplace = function (value: string) {
	return value.replace(config.CONSTANT.REGEX.STRING_REPLACE, "");
};

let isValidMobileNumber = function (countryCode, mobileNo) {
	mobileNo = Number(stringReplace(mobileNo));
	let reExp = config.CONSTANT.REGEX.MOBILE_NUMBER;
	return reExp.test(mobileNo);
};

let clean = function (object) {
	for (let propName in object) {
		if (object[propName] === null || object[propName] === undefined || object[propName] === "") {
			delete object[propName];
		}
	}
	delete object["createdAt"];
	delete object["updatedAt"];
	return object;
};

let convertMillisToEndOfTheDay = function (value: number) {
	// 1545868800000 to 1545955199999
	return value + 86399999;
};

let captalizeFirstLetter = function (value: string) {
	return value.charAt(0).toUpperCase() + value.substr(1);
};

let convertTimestampToDate = function (value: number) {
	// 1545868800000 to 01-01-2019
	let year = new Date(value).getFullYear();
	let month = ((new Date(value).getMonth() + 1) < 10) ? "0" + (new Date(value).getMonth() + 1) : (new Date(value).getMonth() + 1);
	let day = (new Date(value).getDate() < 10) ? "0" + new Date(value).getDate() : new Date(value).getDate();

	return day + "-" + month + "-" + year;
};

let convertTimestampToUnixDate = function (value: number) {
	// 1546281000000 to 31 Dec 2018
	return moment.utc(value).format("DD MMM YYYY");
};

let convertTimestampToLocalDate = function (value: number) {
	// 1546281000000 to 01 Jan 2019
	return moment(value).format("DD MMM YYYY");
};

let diffHours = function (dt1, dt2) {
	let d1 = new Date(dt1);
	let d2 = new Date(dt2);
	let diff = (d1.getTime() - d2.getTime()) / 1000;
	diff /= (60 * 60);
	return Math.abs(Math.round(diff));
};

let convertStringDateToTimestamp = function (value: string) {
	// 03 Jun 2011 to 1307039400000
	// 3 Jun 2011 to 1307039400000
	return new Date(value).getTime();
};

let excelFilter = function (fileName: string) {
	// accept image only
	if (!fileName.toLowerCase().match(/\.(csv|xlsx|xls)$/)) {
		return false;
	}
	return true;
};

let getDynamicName = function (file) {
	return (new Date().getTime() + "_" + randomstring.generate(5) + path.extname(file.hapi.filename));
};

let deleteFiles = function (filePath) {
	// delete files inside folder but not the folder itself
	del.sync([`${filePath}`, `!${config.SERVER.UPLOAD_DIR}`]);
	logger.info(TAG, "All files deleted successfully.");
};

function _filterReadAndParseJSON(json) {
	json = _.filter(json, function (value) {
		if (value["email"] ? !isValidEmail(value["email"]) : false) {
			return;
		} else if (!value["email"] && (!value["countryCode"] || !value["mobileNo"])) {
			return;
		} else {
			return value;
		}
	});
	return json;
}

let readAndParseJSON = function (json) {
	const excelKeyMap = config.CONSTANT.EXCEL_KEY_MAP;
	json = _.map(json, (element, elementIndex) => {
		let jsonTemp = {};
		_.each(element, (value, index) => {
			if (value) {
				if (typeof excelKeyMap[index] !== "undefined") {
					if (typeof excelKeyMap[index] === "object") {
						if (typeof jsonTemp[excelKeyMap[index]["parent"]] === "undefined") {
							jsonTemp[excelKeyMap[index]["parent"]] = {};
						}
						jsonTemp[excelKeyMap[index]["parent"]][excelKeyMap[index]["child"]] = value;
					} else {
						jsonTemp[excelKeyMap[index]] = value;
					}
				} else if (typeof excelKeyMap[index] === "undefined") {
					delete excelKeyMap[index];
				} else {
					jsonTemp[index] = value;
				}
			}
		});
		jsonTemp["status"] = (jsonTemp["status"] === "Active") ? config.CONSTANT.STATUS.UN_BLOCKED : config.CONSTANT.STATUS.BLOCKED;
		if (jsonTemp["gender"]) {
			jsonTemp["gender"] = (jsonTemp["gender"] === "Male") ? config.CONSTANT.GENDER.MALE : config.CONSTANT.GENDER.FEMALE;
		}
		if (jsonTemp["dob"]) {
			jsonTemp["dob"] = convertStringDateToTimestamp(jsonTemp["dob"]) + 19800000;
			jsonTemp["age"] = calculateAge(jsonTemp["dob"]);
		}
		return jsonTemp;
	});
	return _filterReadAndParseJSON(json);
};

const queryBuilder = (pipeline: Array<Object>, skip: number, limit: number, pageNo: number): Array<Object> => {
	let query = pipeline || [];

	query.push({
		"$facet": {
			data: [
				{ "$skip": skip },
				{ "$limit": limit }
			],
			metadata: [
				{ "$count": "total" }
			]
		}
	});
	return query;
};

let paginate = async (Model: any, pipeline?: Array<Object>, limit?: number, pageNo?: number) => {
	try {
		if (limit) {
			limit = Math.abs(limit);

			// If limit exceeds max limit
			if (limit > 100) {
				limit = 100;
			}
		} else {
			limit = 10;
		}
		if (pageNo && (pageNo !== 0)) {
			pageNo = Math.abs(pageNo);
		} else {
			pageNo = 1;
		}
		let skip = (limit * (pageNo - 1));
		const result = await Model.aggregate(queryBuilder(pipeline, skip, limit, pageNo)).exec();

		return {
			"data": result[0]["data"],
			"total": result[0]["metadata"] && result[0]["metadata"][0] ? result[0]["metadata"][0]["total"] : 0
		};
	} catch (error) {
		throw new Error(error);
	}
};

let stringifyNumber = function (n) {
	const special = ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelvth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
	const deca = ["twent", "thirt", "fourt", "fift", "sixt", "sevent", "eight", "ninet"];
	if (n < 20) { return special[n]; }
	if (n % 10 === 0) { return deca[Math.floor(n / 10) - 2] + "ieth"; }
	return deca[Math.floor(n / 10) - 2] + "y-" + special[n % 10];
};

/**
 * @name createStream
 * @description To create stream
 * @param userInfo - userData comes from mongo query
 * @param ExcelSheetheader - header for exel sheet
*/
// let createStream = function (mongoQueryData: [object], ExcelSheetheader, sheetName: string) {
let createStream = function (mongoQueryData: any, ExcelSheetheader, sheetName: string) {
	let createInstace = new ExcelJs("Admin");
	let CreateWorkSheet = createInstace.addWorksheet(sheetName);
	createInstace.addColumns(CreateWorkSheet, ExcelSheetheader);
	createInstace.addRows(CreateWorkSheet, mongoQueryData);
	return createInstace;
};
/**
 * Generate password
 */
export let generatePassword = function () {
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 8; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};

/**
 * Calculate estimated time and distance source to distination using latlong
 *  from google api distance matrix
 */
let getDistanceTime = function (source, destination) {
	return new Promise(async function (resolve, reject) {
		try {
			let slongitude = source[0];
			let dlongitude = destination.longitude;
			let slatitude = source[1];
			let dlatitude = destination.latitude;
			let or = slatitude + "," + slongitude;
			let ds = dlatitude + "," + dlongitude;
			let result: any = {};
			let options = {
				origin: or, // '28.6060756,77.3597253',
				destination: ds, // '28.668002,77.3808467',
			};
			await GoogleDistance.distancematrix.get(options, function (err, data) {
				result = data;
				resolve(result);
			});
		} catch (err) {
			Promise.reject(err);
			// throw err;
		}
	});
};

/**
 * @function _saveAndSendNotificationChunks
 */
// export let saveAndSendNotificationChunks = async function (params: EditAdminNotificationRequest) {
// 	try {
// 		let step1 = await userDao.getChunksOfUser(params);
// 		// separate user data to android user and ios user
// 		let androidUsers = [], iosUsers = [];
// 		for (let i = 0; i < step1.length; i++) {
// 			if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
// 				androidUsers.push({ "userId": step1[i]._id, "deviceToken": step1[i].deviceToken, "deviceId": step1[i].deviceId, "arn": step1[i].arn });
// 			}
// 			if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
// 				iosUsers.push({ "userId": step1[i]._id, "deviceToken": step1[i].deviceToken, "deviceId": step1[i].deviceId, "arn": step1[i].arn });
// 			}
// 		}

// 		// save data to notification history for android
// 		await androidUsers.forEach(async (data) => {
// 			let noticiationData = {
// 				"receiverId": data.userId,
// 				"title": params.title,
// 				"message": params.message,
// 				"deviceId": data.deviceId,
// 				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION
// 			};
// 			let step2 = await notificationDao.addNotification(noticiationData);
// 		});

// 		// save data to notification history for IOS
// 		await iosUsers.forEach(async (data) => {
// 			let noticiationData = {
// 				"receiverId": data.userId,
// 				"title": params.title,
// 				"message": params.message,
// 				"deviceId": data.deviceId,
// 				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION
// 			};
// 			let step3 = await notificationDao.addNotification(noticiationData);
// 		});

// 		// separate android user data and ios user data to android user chunks and ios user chunks
// 		let androidUserChunks = this.splitArrayInToChunks(androidUsers);
// 		let iosUserChunks = this.splitArrayInToChunks(iosUsers);

// 		// create android and ios payload
// 		let androidPayload, iosPayload;
// 		if (androidUserChunks.length) {
// 			androidPayload = this.createAndroidPushPayload(params);
// 		}
// 		if (iosUserChunks.length) {
// 			iosPayload = this.createIOSPushPayload(params);
// 		}

// 		// save android chunk data
// 		await androidUserChunks.forEach(async (data) => {
// 			let chunkNoticiationPayload = {
// 				"data": data,
// 				"payload": androidPayload,
// 				"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
// 			};
// 			let step4 = await pushManager.pushNotification(chunkNoticiationPayload);
// 		});

// 		// save ios chunk data
// 		await iosUserChunks.forEach(async (data) => {
// 			let chunkNoticiationPayload = {
// 				"data": data,
// 				"payload": iosPayload,
// 				"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
// 			};
// 			let step5 = await pushManager.pushNotification(chunkNoticiationPayload);
// 		});
// 		return step1.length;
// 	} catch (error) {
// 		throw error;
// 	}
// };

export {
	verifyEmailFormat,
	setInsertObject,
	unsetInsertObject,
	buildToken,
	genRandomString,
	encryptHashPassword,
	toObjectId,
	failActionFunction,
	convertISODateToTimestamp,
	splitArrayInToChunks,
	createAndroidPushPayload,
	createWebPushPayload,
	createIOSPushPayload,
	calculateAge,
	convertStringToRegExp,
	convertRegExpToString,
	CryptDataMD5,
	encodeToBase64,
	decodeBase64,
	// tinyUrl,
	getRandomOtp,
	isValidEmail,
	stringToBoolean,
	stringReplace,
	isValidMobileNumber,
	clean,
	convertMillisToEndOfTheDay,
	captalizeFirstLetter,
	convertTimestampToDate,
	convertTimestampToUnixDate,
	convertTimestampToLocalDate,
	convertStringDateToTimestamp,
	excelFilter,
	getDynamicName,
	deleteFiles,
	readAndParseJSON,
	paginate,
	stringifyNumber,
	createStream,
	diffHours,
	getDistanceTime
};