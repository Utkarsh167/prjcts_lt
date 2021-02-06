declare interface AddAdminNotificationRequest extends TokenData {
	image: string;
	title: string;
	link: string;
	message: string;
	appPlatform?: string;
	fromDate: number;
	toDate?: number;
	gender?: string;
	sentCount?: number;
	audience?: string;
	createdBy?: string;
	scheduleType?: string;
	notificationType?: number;
	scheduleTime?: number;
	companyCode?: string;
	receiverId?: string;
	senderId?: string;
	body: string;
}

declare interface DeleteAdminNotificationRequest extends NotificationId, TokenData { }

declare interface EditAdminNotificationRequest extends AddAdminNotificationRequest, NotificationId { }

declare interface SendAdminNotificationRequest extends TokenData {
	image?: string;
	title: string;
	link: string;
	message: string;
}

declare interface SendBulkNotificationRequest extends NotificationId, TokenData { }