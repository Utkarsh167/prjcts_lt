"use strict";

import * as HapiSwagger from "hapi-swagger";
import * as Inert from "inert";
// import * as Vision from "vision";

import * as config from "../config/environment";

// Register Swagger Plugin
export let plugin = {
	name: "swagger-plugin",
	register: async function (server) {
		const swaggerOptions = {
			info: {
				title: "Commutev API Documentation",
				description: "Commutev",
				contact: {
					name: "Rajat Maheshwari",
					email: "rajat.maheshwari@appinventiv.com"
				},
				version: "1.0.0"
			},
			tags: [{
				name: "admin",
				description: "API of admin",
				externalDocs: {
					description: "Find out more about admin",
					url: "http://example.org"
				}
			}, {
				name: "common",
				description: "common API"
			}, {
				name: "content",
				description: "API of content",
				externalDocs: {
					description: "Find out more about content",
					url: "http://example.org"
				}
			}, {
				name: "notification",
				description: "API of notification",
				externalDocs: {
					description: "Find out more about notification",
					url: "http://example.org"
				}
			}, {
				name: "user",
				description: "API of user",
				externalDocs: {
					description: "Find out more about user",
					url: "http://example.org"
				}
			}, {
				name: "version",
				description: "API of version",
				externalDocs: {
					description: "Find out more about version",
					url: "http://example.org"
				}
			}],
			grouping: "tags",
			schemes: ["http"],
			basePath: config.SERVER.API_BASE_URL,
			consumes: [
				"application/json",
				"application/x-www-form-urlencoded",
				"multipart/form-data"
			],
			produces: [
				"application/json"
			],
			securityDefinitions: {
				// basicAuth: {
				// 	type: "basic",
				// 	name: "basic_auth",
				// 	in: "header"
				// },
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header"
				}
			},
			// security: [{
			// 	basicAuth: []
			// }],
			// sortTags: "name",
			// sortEndpoints: "method",
			// cache: {
			// 	expiresIn: 24 * 60 * 60 * 1000
			// }
		};

		await server.register([
			Inert,
			// Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
		]);
	}
};