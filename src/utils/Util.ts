"use strict";

import { logger } from "@lib/logger";

export function log(target, key, descriptor) {
	const originalMethod = descriptor.value;
	descriptor.value = function () {
		console.log(`${key} was called with:`, arguments);
		let result = originalMethod.apply(this, arguments);
		return result;
	};
	return descriptor;
}

export function init(target) {
	return class extends target {
		firstName = "Ankit";
		lastName = "Garg";
		sayMyName() {
			return `${this.firstName} ${this.lastName}`;
		}
	};
}

interface PromiseDescriptorValue<T> {
	(...args: any[]): Promise<T>;
}

export function genericLog<T>(): any {
	return (
		target: Object,
		propertyKey: string,
		descriptor: any): TypedPropertyDescriptor<PromiseDescriptorValue<T>> => {
		const originalMethod = descriptor.value;
		descriptor.value = function () {
			logger.info(`Execution in ${propertyKey}`, arguments);
			let result = originalMethod.apply(this, arguments);
			return result;
		};
		return descriptor;
	};
}