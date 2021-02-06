declare interface AlgoDataRequest {
	maxGroupSize: number;
	waitTime: number;
	maxTripDuration: number;
	officeLocation: {
		lat: number;
		long: number;
	};
	employees: [{
		empId: string;
		shift: string;
		shiftStartTime: string;
		shiftEndTime: string;
		weekOff: [number];
		location: {
			lat: number;
			long: number;
		};
		name: string;
		employeeId: string;
		countryCode: string;
		mobileNo: string;
		address: string;
	    // Added gender - Shivakumar A
		gender: string;
	}];
}
declare interface RoutingDataRequest {
	waitTime: number;
	maxTripDuration: number;
	officeLocation: {
		lat: number;
		long: number;
	};
	groups: [{
		grpDbId?: string;
		grpId: number;
		empCount: number;
		grpCentre: {
			lat: number;
			long: number;
		};
		maxGroupSize: number;
		waitTime: number;
		maxTripDuration: number;
		shiftName: string;
		shiftType: string;
		shiftTime: string;
		employees: [{
			empId: string;
			empLocation: {
				lat: number;
				long: number;
			};
			weekOff: [number];
			name: string;
			employeeId: string;
			countryCode: string;
			mobileNo: string;
			address: string;
	      // Added gender - Shivakumar A
		    gender: string;

		}];
		optimize?: boolean;
	}];

}
declare interface AlgoRegenerateDataRequest {
	maxGroupSize: number;
	waitTime: number;
	maxTripDuration: number;
	officeLocation: {
		lat: number;
		long: number;
	};
	employees: [{
		empId: string;
		shiftName: string;
		shiftTime: string;
		shiftType: string;
		weekOff: [number];
		location: {
			lat: number;
			long: number;
		};
		name: string;
		employeeId: string;
		countryCode: string;
		mobileNo: string;
		address: string;
	    // Added gender - Shivakumar A
		gender: string;

	}];
}