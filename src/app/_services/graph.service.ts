import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  public baseUrlLocal="http://localhost/feedibackphp/admin-panel/handlers/FunctionListHandler.php";
  public baseUrlServer="http://13.126.106.225/feediback-backend/admin-panel/handlers/FunctionListHandler.php";


  constructor(private http: HttpClient) { }

   getGraphData(surveyId: string, tabletId: string,identifier:string,start_date: string,end_date:string) {
   let formData: FormData = new FormData();
   formData.append('survey_id',surveyId);
   formData.append('tablet_id',tabletId);
   formData.append('identifier',identifier);
   formData.append('start_date',start_date);
   formData.append('end_date',end_date);

        return this.http.post<any>(this.baseUrlLocal, formData)

        .pipe(map(data => {
            // login successful if there's a jwt token in the response
            //if(user && user.success){
                console.log(data);
               
                // store user details and jwt token in local storage to keep user logged in //between page refreshes
                // localStorage.setItem('tokenObject', JSON.stringify(user.object));
           // }
            return data;
        }));
    }
}
