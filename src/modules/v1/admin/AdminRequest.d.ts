declare interface CreateAdminRequest extends TokenData {
	name: string;
	email: string;
	password: string;
	adminType: string;
}

declare interface DeleteSubAdmin extends TokenData { }

declare interface EditSubAdminRequest extends TokenData {
	name: string;
	email: string;
	password?: string;
	salt?: string;
	hash?: string;
}

declare interface AdminLoginRequest extends Device {
	email: string;
	password: string;
	salt: string;
	hash: string;
}

declare interface EditProfileRequest extends TokenData {
	name: string;
	email: string;
	shiftSlot: [ShiftSlot];
	address: string;
	longitude: number;
	latitude: number;
}