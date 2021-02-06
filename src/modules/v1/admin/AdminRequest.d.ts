declare interface CreateAdminRequest extends TokenData {
	name: string;
	email: string;
	password: string;
	companyBranch?: string;
	companyAddress?: string;
	plane?: {};
	url?: string;
	shiftSlot?: [ShiftSlot];
	address?: string;
	longitude?: number;
	latitude?: number;
	companyId?: string;
	contactNumber?: [CompanyMobile];
	companyType?: string;
	maxGroupRadius?: number;
	routeConf?: {};
	crfLimitMonth?: number;
	isProfileComplete?: Boolean;
}

declare interface DeleteSubAdmin extends TokenData {
	// reasonForArchive -- satyam
	comment?: string;
 }

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
	// CRF - timings --- satyam
	loginCutoff: number;
	logoutCutoff: number;
}

declare interface ShiftName extends TokenData {
	shiftName?: string;
}