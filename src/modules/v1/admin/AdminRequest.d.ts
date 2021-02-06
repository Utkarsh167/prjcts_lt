declare interface CreateAdminRequest extends TokenData {
	name: string;
	email: string;
	password: string;
	companyId?: string;
	contactNo?: string;
	created?: number;
	contactNumber?: [CompanyMobile];
	isProfileComplete?: Boolean;
}

declare interface DeleteSubAdmin extends TokenData { }

declare interface EditSubAdminRequest extends TokenData {
	companyLocationName?: string;
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
	userType?: number;
}

declare interface CompanyMobile {
	phoneNumber?: string;
}

declare interface EditProfileRequest extends TokenData {
	name: string;
	email: string;
	shiftSlot: [ShiftSlot];
	address: string;
	longitude: number;
	latitude: number;
	crfLimitMonth: number;
}

declare interface ShiftName extends TokenData {
	shiftName?: string;
}

declare interface Settings extends TokenData{
	booking_status_cutoff?: number;
	geofence_cutoff?: number;
}
