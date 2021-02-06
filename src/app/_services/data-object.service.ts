import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataObjectService {

public scope: Array<any> | boolean = false;

    constructor() {
    }

    public getScope(): Array<any> | boolean {
        return this.scope;
    }

    public setScope(scope: any): void {
        this.scope = scope;
    }
}
