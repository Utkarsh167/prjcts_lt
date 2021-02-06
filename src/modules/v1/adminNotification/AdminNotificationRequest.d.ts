declare interface AddAdminNotificationRequest extends TokenData {
	image: string;
	title: string;
	audience: string;
	// link: string;
	message: string;
	body: string;
	// appPlatform?: string;
	// fromDate: number;
	// toDate?: number;
	// gender?: string;
	sentCount?: number;
	targetAudience?: AudienceType;
	notificationId?: string;
	notificationType?: number;
	senderId?: string;
}

declare interface AudienceType {
	name?: string;
	_id?: string;
	email?: string;
}

declare interface DeleteAdminNotificationRequest extends NotificationId, TokenData { }

declare interface EditAdminNotificationRequest extends AddAdminNotificationRequest, NotificationId { }

declare interface SendAdminNotificationRequest extends AddAdminNotificationRequest, TokenData { }

declare interface SendBulkNotificationRequest extends AddAdminNotificationRequest, TokenData { }