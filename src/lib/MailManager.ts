"use strict";

import * as nodemailer from "nodemailer";
import * as sgTransport from "nodemailer-sendgrid-transport";
import * as ses from "nodemailer-ses-transport";

import * as config from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";

const imagepath = require("path");

// using sendgrid
const options = {
	auth: {
		api_user: config.SERVER.MAIL.SENDGRID.API_USER,
		api_key: config.SERVER.MAIL.SENDGRID.API_KEY
	}
};
const client = nodemailer.createTransport(sgTransport(options));

// using smtp
let transporter = nodemailer.createTransport({
	host: config.SERVER.MAIL.SMTP.HOST,
	port: config.SERVER.MAIL.SMTP.PORT,
	secure: false, // use SSL
	requireTLS: true,
	auth: {
		user: config.SERVER.MAIL.SMTP.USER,
		pass: config.SERVER.MAIL.SMTP.PASSWORD
	}
});

// using Amazon SES
let sesTransporter = nodemailer.createTransport(ses({
	accessKeyId: "YOUR_AMAZON_KEY",
	secretAccessKey: "YOUR_AMAZON_SECRET_KEY"
}));

export class MailManager {
	private fromEmail: string = config.CONSTANT.EMAIL_TEMPLATE.FROM_MAIL;

	constructor() { }

	async sendMailViaSendgrid(params) {
		try {
			let mailOptions = {
				from: `'S-Park' <${this.fromEmail}>`, // sender email
				to: params.email, // list of receivers
				subject: params.subject, // Subject line
				html: params.content,
				// bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL
			};
			let mailResponse = await client.sendMail(mailOptions);
		} catch (error) {
			console.log(error);
		}
		return {};
	}

	async sendMailViaSmtp(params) {
		try {
			let mailOptions = {
				from: `S-Park <${this.fromEmail}>`,
				to: params.email,
				subject: params.subject,
				html: params.content,
				//  bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log("main error" + error);
					console.log(error);
				} else {
					console.log("Message sent: " + info.response);
				}
			});
		} catch (error) {
			console.log("errororrrrrr" + error);
			console.log(error);
		}
		return {};
	}

	async sendMailViaAmazonSes(params) {
		try {
			sesTransporter.sendMail({
				from: `'FLEET' <${this.fromEmail}>`,
				to: params.email,
				subject: params.subject,
				text: params.content,
				// cc: 'superganteng@yopmail.com, supertampan@yopmail.com',
				bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL,
				// attachments: [{
				// 	filename: 'My Cool Document',
				// 	path: 'https://path/to/cool-document.docx',
				// 	contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				// }]
			});
		} catch (error) {
			console.log(error);
		}
		return {};
	}

	async sendMail(params) {
		if (config.SERVER.MAIL_TYPE === config.CONSTANT.MAIL_SENDING_TYPE.SMTP) {
			return await this.sendMailViaSendgrid(params);
		} else {
			return await this.sendMailViaSmtp(params);
		}
	}

	async sendAdminForgotPasswordEmail(params) {
		let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": config.SERVER.ADMIN_URL + "/account/reset-password/" + params.accessToken,
				"year": new Date().getFullYear(),
				"userName": config.SERVER.ADMIN_CREDENTIALS.NAME
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}

	async sendForgotPasswordEmail(params) {
		let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": params.url, // config.SERVER.ADMIN_URL + "/forgot-password/" + params.accessToken,
				"year": new Date().getFullYear(),
				"userName": params.name, // config.SERVER.ADMIN_CREDENTIALS.NAME
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}
	async sendSignupPasswordEmail(params) {
		let absolutePath = config.SERVER.APP_URL + "/public/image/";
		// console.log(JSON.stringify(params) + "absolutePath===============" + absolutePath);
		let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "signup-password.html"))
			.compileFile({
				"name": params.name,
				"companyCode": params.companyCode,
				"password": params.password,
				"email": params.email,
				"year": new Date().getFullYear(),
				"userName": config.SERVER.ADMIN_CREDENTIALS.NAME,
				"absolutePath": absolutePath,
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.SIGNUP_PWD_EMAIL, "content": mailContent });
	}
}