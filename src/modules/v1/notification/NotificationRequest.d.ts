declare interface NotificationId {
	notificationId?: string;
}

declare interface AddNotificationRequest {
	senderId?: string;
	receiverId: string;
	title: string;
	message: string;
	deviceId: string;
	notificationType: number;
}