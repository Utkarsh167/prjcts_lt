import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  configData:any=[
  {"status_id":"1","status":"active"},
  {"status_id":"2","status":"inactive"},
  {"status_id":"3","status":"archived"},
  {"status_id":"4","status":"draft"}
]
  constructor() { }
}
