declare namespace AuditLogRequest {

	export interface Add {
		moduleName: string;
		userId: string;
		userName: string;
		userEmail: string;
		targetEmail: string;
		targetId: string;
		targetName: string;
		message: string;
		// crudAction: string;
		actionType: string;
		created: number;
		type: string;
		// companyCode: string;
		regNo: string;
		companyId: string;
	}
}