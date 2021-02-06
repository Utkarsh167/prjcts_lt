"use strict";

const AWS = require("aws-sdk"),
	fs = require("fs");

import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";

export class ImageUtil {

	constructor() {
		AWS.config.update({
			accessKeyId: config.SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
			secretAccessKey: config.SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY
		});
	}

	private imageFilter(fileName: string) {
		// accept image only
		if (!fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
			return false;
		}
		return true;
	}

	/**
	 * @function uploadImage This Function is used to uploading image to S3 Server
	*/
	private _uploadToS3(fileName, fileBuffer) {
		try {
			return new Promise((resolve, reject) => {
				let s3 = new AWS.S3({ params: { Bucket: config.SERVER.S3.BUCKET_NAME } });
				s3.upload({
					Key: String(fileName),
					Body: fileBuffer,
					ContentType: "image/png",
					Bucket: config.SERVER.S3.BUCKET_NAME,
					ACL: config.SERVER.S3.ACL
				}, (error, data) => {
					if (error) {
						console.log("Upload failed: ", error);
						reject(error);
					} else
						resolve(data);
				});
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function uploadSingleMediaToS3 This Function is used to upload single image to S3 Server
	*/
	uploadSingleMediaToS3(file) {
		return new Promise((resolve, reject) => {
			if (this.imageFilter(file.hapi.filename)) {
				let fileName = appUtils.getDynamicName(file);
				const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}`;
				let r = file.pipe(fs.createWriteStream(filePath));
				r.on("close", () => {
					fs.readFile(filePath, (error, fileBuffer) => {
						if (error) {
							reject(error);
						}

						this._uploadToS3(fileName, fileBuffer)
							.then((data: any) => {
								appUtils.deleteFiles(filePath);
								let location = data.Location;
								resolve(location);
							})
							.catch((error) => {
								reject(error);
							});
					});
				});
			} else {
				reject(new Error("Invalid file type!"));
			}
		});
	}
}