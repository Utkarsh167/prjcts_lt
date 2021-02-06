"use strict";

import { QueryFindOneAndUpdateOptions } from "mongoose";

import * as models from "@modules/v1/models";

export class BaseDao {

	constructor() { }

	async save(model: ModelNames, data: any) {
		try {
			let ModelName: any = models[model];
			return await new ModelName(data).save();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async find(model: ModelNames, query: any, projection: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.find(query, projection, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findInArr(model: ModelNames, query: any) {
		try {
			let ModelName: any = models[model];
			return await ModelName.find(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findWithPaginate(model: ModelNames, query: any, projection: any, options: QueryFindOneAndUpdateOptions, collectionOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.find(query, projection, options).skip((collectionOptions - 1) * collectionOptions.limit).limit(collectionOptions.limit).sort({ createdAt: -1 });
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async distinct(model: ModelNames, path: string, query: any) {
		try {
			let ModelName: any = models[model];
			return await ModelName.distinct(path, query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findOne(model: ModelNames, query: any, projection: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.findOne(query, projection, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findOneAndUpdate(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.findOneAndUpdate(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findAndRemove(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.findOneAndRemove(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async update(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.update(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async updateOne(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.updateOne(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async updateMany(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.updateMany(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async deleteMany(model: ModelNames, query: any) {
		try {
			let ModelName: any = models[model];
			return await ModelName.deleteMany(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async remove(model: ModelNames, query: any) {
		try {
			let ModelName: any = models[model];
			return await ModelName.remove(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async populateData(model: ModelNames, query: any, projection: any, options: QueryFindOneAndUpdateOptions, collectionOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.find(query, projection, options).populate(collectionOptions).exec();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async count(model: ModelNames, query: any) {
		try {
			let ModelName: any = models[model];
			return await ModelName.count(query);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async aggregate(model: ModelNames, aggPipe, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			let aggregation: any = ModelName.aggregate(aggPipe);
			if (options) {
				aggregation.options = options;
			}
			return await aggregation.exec();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async insert(model: ModelNames, data, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			let obj = new ModelName(data);
			await obj.save();
			return obj;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async insertMany(model: ModelNames, data, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.collection.insertMany(data, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async aggregateDataWithPopulate(model: ModelNames, group, populateOptions) {
		try {
			let ModelName: any = models[model];
			let aggregate = await ModelName.aggregate(group);
			let populate = await ModelName.populate(aggregate, populateOptions);
			return populate;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async bulkFindAndUpdate(bulk, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			return await bulk.find(query).upsert().update(update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async bulkFindAndUpdateOne(bulk, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			return await bulk.find(query).upsert().updateOne(update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async findByIdAndUpdate(model: ModelNames, query: any, update: any, options: QueryFindOneAndUpdateOptions) {
		try {
			let ModelName: any = models[model];
			return await ModelName.findByIdAndUpdate(query, update, options);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	// User change password
	async changePassword(params: ChangeUserPasswordRequest) {
		let query: any = {};
		query._id = params.userId;
		let update: any = {};
		update["$set"] = {
			hash: params.hash,
			salt: params.salt
		};
		let options: any = {};
		let response = await this.update("users", query, update, options);
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

	/**
	 * @function removeDeviceById
	 */
	async removeDeviceById(params: Device) {
		let query: any = {};
		query.userId = params.userId;
		if (params.deviceId) {
			query.deviceId = params.deviceId;
		}
		query.isLogin = true;

		let update = {};
		update["$set"] = {
			"isLogin": false,
			"lastLogin": Date.now()
		};
		update["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

		let options: any = { multi: true };

		return await this.updateMany("login_histories", query, update, options);
	}

	/*async getColl(model: ModelNames) {
		try {
			let ModelName: any = models[model];
			let changeStream = await ModelName.watch({fullDocument: "updateLookup"});
			changeStream.on("change", (error, data) => {
				console.log(data);
			});
			console.log(changeStream);
			return changeStream;
		} catch (error) {
			return Promise.reject(error);
		}
	}*/
}