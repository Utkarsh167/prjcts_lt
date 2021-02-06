// "use strict";

// import * as appUtils from "@utils/appUtils";
// import * as config from "@config/index";
// import { error } from "util";

// // Twilio Constants
// const TWILIO_NUMBER = config.SERVER.TWILIO.TWILIO_NUMBER,
// 	// client = require("twilio")(config.SERVER.TWILIO.ACCOUNT_SID, config.SERVER.TWILIO.AUTH_TOKEN);

// const LINKS = {
// 	FORGOT_PASSWORTD_LINK: config.SERVER.APP_URL + "/forgot-password/[TOKEN]"
// };

// let smsCounter = 0;

// function _sendMessage(countryCode, mobileNo, body) {
// 	console.log("send message -----------------");
// 	// Validate Number Locally
// 	_validateNumber(countryCode, mobileNo);
// 	// Validate Number With Twilio
// 	return client.messages.create({
// 		to: "+" + countryCode + mobileNo,
// 		from: TWILIO_NUMBER,
// 		body: body
// 	})
// 		.then(function (data) {
// 			smsCounter++;
// 		})
// 		.catch(function (error) {
// 			throw error;
// 		});
// }

// function _validateNumber(countryCode, mobileNo) {
// 	if (!appUtils.isValidMobileNumber(countryCode, mobileNo)) {
// 		return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_MOBILE_NUMBER);
// 	}
// 	if (config.SERVER.ENVIRONMENT !== "prod" && smsCounter > 100) {
// 		return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED_MOBILE);
// 	}
// }

// export let sendForgotPasswordLink = function (countryCode, mobileNo, token) {
// 	return new Promise(async function (resolve, reject) {
// 		try {
// 			let link = LINKS.FORGOT_PASSWORTD_LINK.replace(config.CONSTANT.SMS.TOKEN, token);
// 			let tinyLink = await appUtils.tinyUrl(link);
// 			let sms = config.CONSTANT.SMS.TEMPLATES.FORGOT_PASSWORD.replace(/LINK/g, String(tinyLink));
// 			resolve(_sendMessage(countryCode, mobileNo, sms));
// 		} catch (error) {
// 			throw error;
// 		}
// 	});
// };

// export let sendSms = function (countryCode, mobileNo, token) {
// 	console.log(countryCode + "mobileNo" + mobileNo + "token" + token);
// 	try {
// 		let sms = "dfdfdsf";
// 		_sendMessage(countryCode, mobileNo, sms);
// 	} catch (error) {
// 		throw error;
// 	}
// };

// export let purchase = function (params) {
// 	try {
// 		_purchase(params);
// 	} catch (error) {
// 		throw error;
// 	}
// };

// function _purchase(params) {
// 	console.log(JSON.stringify(params) + "purchase=========");
// 	let areaCode = params.countryCode;
// 	let phoneNumber;
// 	console.log("+++++++++++++++++++++++++++++++++++++areacode+++++++++");
// 	return client.availablePhoneNumbers('US').local.list({
// 		areaCode: +91,
// 		voiceEnabled: true,
// 		smsEnabled: true
// 	}).then(function (searchResults) {
// 		console.log("search");
// 		console.log(searchResults + "================searchResults=============");
// 		if (searchResults.availablePhoneNumbers.length === 0) {
// 			throw { message: 'No numbers found with that area code' };
// 		}

// 		return client.incomingPhoneNumbers.create({
// 			phoneNumber: params.mobileNo,
// 			voiceApplicationSid: config.SERVER.TWILIO.APPLICATION_SID,
// 			smsApplicationSid: config.SERVER.TWILIO.APPLICATION_SID
// 		});
// 	}).then(function (phonenumber) {
// 		console.log(phonenumber + "================number=============");
// 		return phonenumber.phone_number;
// 	}).catch(function (error) {
// 		throw error;
// 	});
// }
