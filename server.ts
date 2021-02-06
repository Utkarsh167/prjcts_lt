"use strict";

console.log("");
console.log("//************************* FLEET 1.0 **************************//");
console.log("");

// Internal Dependencies
require("module-alias/register");
import * as Hapi from "hapi";
import * as fs from "fs";

// import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";
import { Database } from "@utils/Database";
import { ElasticSearch, logger } from "@lib/index";
import { plugins } from "@plugins/index";
import { routes } from "@routes/index";
import { BootStrap } from './src/utils/BootStrap';


// let boot;
// switch (config.SERVER.API_VERSION) {
// 	case "v1":
// 		import("@modules/v1/shared/BootStrap")
// 			.then((something) => {
// 				boot = new something.BootStrap();
// 			});
// }

console.log("env : ", config.SERVER.ENVIRONMENT);

// create folder for upload if not exist
if (!fs.existsSync(config.SERVER.UPLOAD_DIR)) fs.mkdirSync(config.SERVER.UPLOAD_DIR);

// create folder for logs if not exist
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

try {
	const server = Hapi.server({
		port: config.SERVER.PORT,
		routes: {
			files: { relativeTo: process.cwd() + "/src/public/image" },
			cors: {
				origin: ["*"],
				headers: ["Accept", "api_key", "authorization", "Content-Type", "If-None-Match", "platform"],
				// additionalHeaders: ["Accept", "api_key", "authorization", "Content-Type", "If-None-Match", "platform"] // sometime required
			},
			// Added timeout -Utkarsh
			timeout: {
				server: 60000 * 5,
				socket: 60000 * 10
		  }
		}
	});

	const start = async () => {
		await server.register(require("vision"));
		server.views({
			engines: {
				html: require("handlebars")
			},
			path: "src/views"
		});
	};
	start();

	const init = async () => {
		await server.register(plugins);
		// await server.register({plugin: YourPlugin}, {routes:{prefix: '/api'}});

		// serving static file
		server.route({
			method: "GET",
			path: "/public/image/{param*}",
			handler: {
				directory: {
					path: ".",
					redirectToSlash: true,
					index: true,
					listing: true
				}
			}
		});

		try {
			server.route(routes(config.SERVER.API_VERSION));
			server.log("info", "Plugins loaded");
			await server.start();
			// let db = new Database();
			// await db.connectToDb();

			// If redis is enabled
			// if (config.SERVER.IS_ELASTIC_SEARCH_ENABLE) {
			// 	await ElasticSearch.init();
			// }

			// If elastic search engine is enabled
			// if (config.SERVER.IS_REDIS_ENABLE) {
			// 	await RedisClient.init();
			// }

			// let boots = new BootStrap();
			// boots.initiateSocket(server);
			// boot.bootstrapSeedData();
			// boots.initialteScheduler();

			logger.info(`Hapi server listening on ${config.SERVER.IP}:${config.SERVER.PORT}, in ${config.SERVER.TAG} mode`);
		} catch (error) {
			logger.error("Error while loading plugins : " + error);
		}
	};

	init();
} catch (error) {
	logger.info(error);
}