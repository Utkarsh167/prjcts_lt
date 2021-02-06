"use strict";

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import {CONSTANT} from "@config/constant";
import {config} from "exceljs";

const ENVIRONMENT = process.env.NODE_ENV || "local";

switch (ENVIRONMENT) {
    case "development": {
        if (fs.existsSync(path.join(process.cwd(), "/.env.development"))) {
            dotenv.config({path: ".env.development"});
        } else {
            console.log("Unable to find Environment File");
            process.exit(1);
        }
        break;
    }
    case "staging": {
        if (fs.existsSync(path.join(process.cwd(), "/.env.staging"))) {
            dotenv.config({path: ".env.staging"});
        } else {
            process.exit(1);
        }
        break;
    }
    case "testing": {
        if (fs.existsSync(path.join(process.cwd(), "/.env.testing"))) {
            dotenv.config({path: ".env.testing"});
        } else {
            process.exit(1);
        }
        break;
    }
    case "production": {
        if (fs.existsSync(path.join(process.cwd(), "/.env.production"))) {
            dotenv.config({path: ".env.production"});
        } else {
            process.exit(1);
        }
        break;
    }
    default: {
        if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
            dotenv.config({path: ".env.local"});
        } else {
            process.exit(1);
        }
    }
}

export const SERVER = Object.freeze({
    APP_NAME: "AI Parking",
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
    API_BASE_URL: "/ai-parking/api/" + process.env["API_VERSION"],
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
        EMAIL: "spark@translabinnovations.com",
        PASSWORD: "admin@123",
        NAME: "Demo Admin",
        CONTACTNUMBER: "9999999999",
    },

    COMPANY_DETAILS: {
        CODE: "DELL01",
        NAME: "Dell India",
    },

    COMPANY_DETAILS_TRANSLAB: {
        CODE: "TRANSLAB01",
        NAME: "Translab Innovations pvt ltd",
    },

    ADDRESS_DETAILS: {
        FULL_ADDRESS: "6, Service Rd, Chinappa Layout, Mahadevapura, Bengaluru, Karnataka 560093",
        LAT: "12.981659",
        LNG: "77.694089",
    },

    ADDRESS_DETAILS_TRANSLAB: {
        FULL_ADDRESS: "4th & 5th Floor, Plot No. 1579 27th Main, HSR Layout, 2nd Sector Bangalore-560102",
        LAT: "12.905097",
        LNG: "77.651026",
    },

    CONFIG: {
        BOOKING_STATUS_CUTOFF: 5,
        GEOFENCE_CUTOFF: 500,
    },

    // Building configuration sample data Utkarsh 06/07/2020
    // Updated Building configs Aashiq 14/08/2020
    LOCATIONS: [
        {
            NAME: "SHOWCASE",
            KEY: "project",
            PARQUERY_VALUE: "https://showcase-alpha.io.parquery.com/dashboard/api/",
            USER: "showcase",
            PASSWORD: "audience-another-as-forth"
        },
        {
            NAME: "IVREA",
            KEY: "project",
            PARQUERY_VALUE: "https://ivrea-alpha.io.parquery.com/dashboard/api/",
            USER: "translab",
            PASSWORD: "parquery-test"
        }
    ],

    LOCATIONS_TRANSLAB: [
        {
            NAME: "TRANSLAB",
            KEY: "project",
            PARQUERY_VALUE: "https://demo-alpha-io.parquery.com/dashboard/translab/api/",
            USER: "translab",
            PASSWORD: "parquery-flash"
        },
    ],

    IVREA_CAMERAS: ["ivrea-393", "ivrea-394", "ivrea-395", "ivrea-396", "ivrea-397"],

    CAMERAS_TRANSLAB: ["translab-813"],

    COTESA_CAMERAS: ["cotesa-384"],
    FLOORS: [
        {
            NAME: "Cotesa",
            VALUE: "cotesa",
            KEY: "visual_plan",
            PARQUERY_VALUE: "https://showcase-alpha.io.parquery.com/dashboard/api/plan_image?id=cotesa",
        },
        {
            NAME: "Garibaldi",
            VALUE: "ivrea-garibaldi",
            KEY: "visual_plan",
            PARQUERY_VALUE: "https://ivrea-alpha.io.parquery.com/dashboard/api/plan_image?id=ivrea-garibaldi",
        },
        {
            NAME: "Ospedale",
            VALUE: "ivrea-ospedale",
            KEY: "visual_plan",
            PARQUERY_VALUE: "https://ivrea-alpha.io.parquery.com/dashboard/api/plan_image?id=ivrea-ospedale",
        }
    ],

    FLOORS_TRANSLAB: [
        {
            NAME: "translab-demo",
            VALUE: "translab-demo",
            KEY: "visual_plan",
            PARQUERY_VALUE: "https://demo-alpha-io.parquery.com/dashboard/translab/api/plan_image?id=translab-demo",
        },
    ],

    ZONES: [
        {
            NAME: "P1",
            KEY: "block_id",
            PARQUERY_VALUE: "Municipales",
        },
        {
            NAME: "P2",
            KEY: "block_id",
            PARQUERY_VALUE: "Generales",
        },
        {
            NAME: "P3",
            KEY: "block_id",
            PARQUERY_VALUE: "Ospedale",
        },
        {
            NAME: "P4",
            KEY: "block_id",
            PARQUERY_VALUE: "Garibaldi",
        },
    ],

    ZONES_TRANSLAB: [
        {
            NAME: "P1",
            KEY: "block_id",
            PARQUERY_VALUE: "PARKING ZONE-1",
        },
        {
            NAME: "P2",
            KEY: "block_id",
            PARQUERY_VALUE: "PARKING ZONE-2",
        },
    ],

    SPOTS: [
        {
            NAME: "0"
        },
        {
            NAME: "1"
        },
        {
            NAME: "2"
        },
        {
            NAME: "3"
        },
        {
            NAME: "4"
        },
        {
            NAME: "5"
        },
        {
            NAME: "6"
        },
        {
            NAME: "7"
        },
        {
            NAME: "8"
        },
        {
            NAME: "9"
        },
        {
            NAME: "10"
        },
        {
            NAME: "11"
        },
        {
            NAME: "12"
        },
        {
            NAME: "13"
        },
        {
            NAME: "14"
        },
        {
            NAME: "15"
        },
        {
            NAME: "16"
        },
        {
            NAME: "17"
        },
        {
            NAME: "18"
        },
        {
            NAME: "19"
        },
        {
            NAME: "20"
        },
        {
            NAME: "21"
        },
        {
            NAME: "22"
        },
        {
            NAME: "23"
        },
        {
            NAME: "24"
        },
        {
            NAME: "25"
        },
        {
            NAME: "26"
        },
        {
            NAME: "27"
        },
        {
            NAME: "28"
        },
        {
            NAME: "29"
        },
        {
            NAME: "30"
        },
        {
            NAME: "31"
        },
        {
            NAME: "32"
        },
        {
            NAME: "33"
        },
        {
            NAME: "34"
        },
        {
            NAME: "35"
        },
        {
            NAME: "36"
        },
        {
            NAME: "37"
        },
        {
            NAME: "38"
        },
        {
            NAME: "39"
        },
        {
            NAME: "40"
        },
        {
            NAME: "41"
        },
        {
            NAME: "42"
        },
    ],

    SPOTS_TRANSLAB: [
        {
            NAME: "CAR Parking- 01"
        },
        {
            NAME: "CAR Parking- 02"
        },
        {
            NAME: "CAR Parking- 03"
        },
        {
            NAME: "CAR Parking- 04"
        },
        {
            NAME: "CAR Parking- 05"
        },
        {
            NAME: "CAR Parking- 06"
        }
    ],

    // User Credentials
    USER_CREDENTIALS: {
        EMAIL: "spark@translabinnovations.com",
        NAME: "User One",
        CONTACTNUMBER: "6778999876",
        GENDER: CONSTANT.GENDER.MALE,
        EMPLOYEE_ID: "12345678",
    },
    // Vehicle Details
    VEHICLE_DETAILS: [
        {
            REG_NO: "MP-12-TF6574",
            STATUS: CONSTANT.STATUS.UN_BLOCKED,
            VEHICLE_TYPE: CONSTANT.VEHICLE_TYPE.CAR,
            MODAL: "Maruti Ertiga"
        }

    ],

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
        // SENDGRID: {
        //     API_USER: "translab_blr",
        //     API_KEY: "translab@123"
        // },
        SENDGRID: {
            API_USER: "translab",
            API_KEY: "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"
        },
        // SMTP: {
        //     HOST: "mail.appinventive.com",
        //     PORT: "587",
        //     USER: "do-not-reply@mail.appinventive.com",
        //     PASSWORD: ""
        // }
        SMTP: {
            HOST: "smtp.sendgrid.net",
            PORT: "587",
            USER: "apikey",
            PASSWORD: "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"
        }
    },
    TWILIO: {
        ACCOUNT_SID: process.env["ACCOUNT_SID"],
        AUTH_TOKEN: process.env["AUTH_TOKEN"],
        TWILIO_NUMBER: process.env["TWILIO_NUMBER"],
        APPLICATION_SID: process.env["APPLICATION_SID"]
    },
    BASIC_AUTH: {
        NAME: "translab",
        PASS: "park@9211"
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
