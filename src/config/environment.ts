"use strict";

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import { CONSTANT } from "@config/constant";

const ENVIRONMENT = process.env.NODE_ENV || "local";

switch (ENVIRONMENT) {
	case "development": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.development"))) {
			dotenv.config({ path: ".env.development" });
		} else {
			console.log("Unable to find Environment File");
			process.exit(1);
		}
		break;
	}
	case "staging": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.staging"))) {
			dotenv.config({ path: ".env.staging" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "testing": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.testing"))) {
			dotenv.config({ path: ".env.testing" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "production": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.production"))) {
			dotenv.config({ path: ".env.production" });
		} else {
			process.exit(1);
		}
		break;
	}
	default: {
		if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
			dotenv.config({ path: ".env.local" });
		} else {
			process.exit(1);
		}
	}
}

export const SERVER = Object.freeze({
	APP_NAME: "Commutev",
	BASE_PATH: process.cwd(),
	TEMPLATE_PATH: process.cwd() + "/src/views/",
	UPLOAD_DIR: process.cwd() + "/src/uploads/",
	ONE_DAY_TIME_STAMP: 24 * 60 * 60 * 1000, // 1 day
	SIGNUP_TOKEN_EXPIRATION_TIME: "10m", // 10 min
	JWT_CERT_KEY: "g8b9(-=~Sdf)",
	SALT_ROUNDS: 10,
	JWT_ALGO: "HS256",
	CHUNK_SIZE: 100,
	APP_URL: process.env["APP_URL"],
	ADMIN_URL: process.env["ADMIN_URL"],
	API_VERSION: process.env["API_VERSION"],
	API_BASE_URL: "/fleet/api/" + process.env["API_VERSION"],
	MONGO: {
		DB_NAME: process.env["DB_NAME"],
		DB_URL: process.env["DB_URL"],
		DB_AUTH_URL: process.env["DB_AUTH_URL"],
		OPTIONS: {
			user: process.env["DB_USER"],
			pass: process.env["DB_PASSWORD"],
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			reconnectTries: Number.MAX_VALUE,
			reconnectInterval: 1000
		}
	},
	ADMIN_CREDENTIALS: {
		EMAIL: "admin@commutev.com",
		PASSWORD: "admin@123",
		NAME: "Commutev Admin"
	},
	REDIS: {
		SERVER: process.env["REDIS_URL"],
		REDIS_AUTH_PASS: process.env["REDIS_AUTH_PASS"],
		PORT: 6379,
		NAMESPACE: "fleetapp",
		APP_NAME: "fleet"
	},
	ELASTIC_SEARCH: {
		SERVER: "localhost",
		PORT: 9200,
		HOST: process.env["ELASTIC_SEARCH_HOST"]
	},
	MAIL: {
		SENDGRID: {
			API_USER: "translab_blr",
			API_KEY: "translab@123"
		},
		SMTP: {
			HOST: "mail.appinventive.com",
			PORT: "587",
			USER: "do-not-reply@mail.appinventive.com",
			PASSWORD: ""
		}
	},
	TWILIO: {
		ACCOUNT_SID: process.env["ACCOUNT_SID"],
		AUTH_TOKEN: process.env["AUTH_TOKEN"],
		TWILIO_NUMBER: process.env["TWILIO_NUMBER"],
		APPLICATION_SID: process.env["APPLICATION_SID"]
	},
	BASIC_AUTH: {
		NAME: "fleet",
		PASS: "fleet@123"
	},
	API_KEY: "1234",
	AWS_IAM_USER: {
		ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
		SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"]
	},
	SNS: {
		ACCESS_KEY_ID: process.env["SNS_ACCESS_KEY_ID"],
		SECRET_ACCESS_KEY: process.env["SNS_SECRET_ACCESS_KEY"],
		ANDROID_ARN: process.env["SNS_ANDROID_ARN"],
		IOS_ARN: process.env["SNS_IOS_ARN"],
		API_VERSION: process.env["SNS_API_VERSION"],
		REGION: process.env["SNS_REGION"],
		TOPIC_ARN: process.env["TOPIC_ARN"],
		PROTOCOL: process.env["SNS_PROTOCOL"]
	},
	// option parameters constantys for s3
	S3: {
		MAX_ASYNC_S3: process.env["MAX_ASYNC_S3"], // this is the default
		S3_RETRY_COUNT: process.env["S3_RETRY_COUNT"], // this is the default
		S3_RETRY_DELAY: process.env["S3_RETRY_DELAY"], // this is the default
		MULTIPART_UPLOAD_THREASHOLD: process.env["MULTIPART_UPLOAD_THREASHOLD"], // this is the default (20 MB)
		MULTIPART_UPLOAD_SIZE: process.env["MULTIPART_UPLOAD_SIZE"], // this is the default (15 MB)
		BUCKET_NAME: process.env["S3_BUCKET_NAME"],
		PUBLIC_BUCKET_NAME: process.env["PUBLIC_BUCKET_NAME"],
		SIGNATURE_VERSION: process.env["SIGNATURE_VERSION"],
		REGION: process.env["S3_REGION"],
		ACL: process.env["ACL"]
	},
	ENVIRONMENT: process.env["NODE_ENV"],
	IP: process.env["IP"],
	PORT: process.env["PORT"],
	SOCKET_PORT: process.env["SOCKET_PORT"],
	SOCKET_URL: process.env["SOCKET_URL"],
	ADMIN_PORT: process.env["ADMIN_PORT"],
	PROTOCOL: process.env["PROTOCOL"],
	TAG: process.env["TAG"],
	FCM_SERVER_KEY: process.env["FCM_SERVER_KEY"],
	FCM_DRIVER_SERVER_KEY: process.env["FCM_DRIVER_SERVER_KEY"],
	FCM_WEB_SERVER_KEY: process.env["FCM_WEB_SERVER_KEY"],
	CLICK_ACTION: process.env["CLICK_ACTION"],
	GOOGLE_API_KEY: process.env["GOOGLE_API_KEY"],
	PUSH_TYPE: CONSTANT.PUSH_SENDING_TYPE.SNS,
	MAIL_TYPE: CONSTANT.MAIL_SENDING_TYPE.SENDGRID,
	IS_REDIS_ENABLE: true,
	IS_ELASTIC_SEARCH_ENABLE: false,
	IS_SINGLE_DEVICE_LOGIN: true,
	ALGO_API_URL: process.env["ALGO_API_URL"],
	ALGO_API_NAME: process.env["ALGO_API_NAME"],
	ALGO_API_PASS: process.env["ALGO_API_PASS"],
	ALGO_API_KEY: process.env["ALGO_API_KEY"],
	API_KEY_YAKO_VOICE: process.env["API_KEY_YAKO_VOICE"],
	CLIENT_ID_YAKO_VOICE: process.env["CLIENT_ID_YAKO_VOICE"],
	CALLER_ID_YAKO_VOICE: process.env["CALLER_ID_YAKO_VOICE"],
	CALL_TYPE_YAKO_VOICE: process.env["CALL_TYPE_YAKO_VOICE"],
	YAKO_VOICE_URL: process.env["YAKO_VOICE_URL"]
});
