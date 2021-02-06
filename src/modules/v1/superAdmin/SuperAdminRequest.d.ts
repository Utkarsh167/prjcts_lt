declare interface CreateCompanyRequest extends TokenData {
	name: string;
	email: string;
	companyCode: string;
	contactNumber: [CompanyMobile];
	companyType: string;
	companyBranch: string;
	companyAddress: string;
	totalEmp: number;
	planeId: string;
	paymentType: string;
	serverType: string;
	url: string;
	companyId: string;
	password: string;
	createdBy: string;
	plane: {};
	address: string;
	longitude: number;
	latitude: number;
	totalAmount: number;
	userId: string;
	maxGroupRadius: number;
}

declare interface CreateSubscriptionRequest extends TokenData {
	name: string;
	price: string;
	description: string;
	year: number;
	month: number;
	gracePeriod: number;
	createdBy: string;
	expiryDate: number;
	subscriptionId: string;
	expiryEndDate: number;
}

declare interface CompanyMobile {
	phoneNumber?: string;
}

declare interface IsCompanyUnique {
	companyCode?: string;
}
declare interface IsSubscriptionUnique {
	name?: string;
}
declare interface CompanyTypeRequest extends TokenData {
	companyType?: string;
	createdBy: string;
	created: number;
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
	longitude: number;
	latitude: number;
}