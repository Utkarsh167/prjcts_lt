"use strict";

import * as mongoose from "mongoose";

import * as config from "@config/environment";
import { logger } from "@lib/logger";

const ENVIRONMENT = process.env.NODE_ENV || "local";

// Connect to MongoDB
export class Database {

	async connectToDb() {
		return new Promise((resolve, reject) => {
			try {
				let dbName = config.SERVER.MONGO.DB_NAME;
				let dbUrl = config.SERVER.MONGO.DB_URL;
				let dbOptions = config.SERVER.MONGO.OPTIONS;
				if (ENVIRONMENT === "production") {
					logger.info("Configuring db in " + config.SERVER.TAG + " mode");
					console.log("Configuring db in " + config.SERVER.TAG + " mode");
					dbUrl = dbUrl + dbName;
				} else {
					logger.info("Configuring db in " + config.SERVER.TAG + " mode");
					console.log("Configuring db in " + config.SERVER.TAG + " mode");
					dbUrl = dbUrl + dbName;
					mongoose.set("debug", true);
				}

				logger.info("Connecting to -> " + dbUrl);
				console.log("Connecting to -> " + dbUrl);
				mongoose.connect(dbUrl, dbOptions);

				// CONNECTION EVENTS
				// When successfully connected
				mongoose.connection.on("connected", function () {
					logger.info("Connected to DB", dbName, "at", dbUrl);
					console.log("Connected to DB", dbName, "at", dbUrl);
					resolve();
				});

				// If the connection throws an error
				mongoose.connection.on("error", function (error) {
					logger.error("DB connection error: " + error);
					console.log("DB connection error: " + error);
					reject(error);
				});

				// When the connection is disconnected
				mongoose.connection.on("disconnected", function () {
					logger.error("DB connection disconnected.");
					console.log("DB connection disconnected.");

					reject("DB connection disconnected.");
				});
			} catch (error) {
				logger.error(error);
				console.log(error);
				reject(error);
			}
		});
	}
}