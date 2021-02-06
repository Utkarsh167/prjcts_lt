import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
  public baseUrlLocal="http://localhost/feedibackphp/admin-panel/api/check_user.php";
  public baseUrlServer="http://13.126.106.225/feediback-backend/admin-panel/api/check_user.php";
  public baseUrlCILocal="http://localhost/feediback_backend/index.php/login/admin_login";
  public baseUrlCIServer="http://13.126.106.225/xp-backend/index.php/login/admin_login";


    constructor(private http: HttpClient) { }
    public give() {
        if (localStorage.getItem('currentUser')) {
            return true;
        } else {
            return false;
        }
    }

    httpOptions = {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin':'*',
          'Content-Type':  'application/json ; charset-utf-8',
          'x-api-key': '123456'
        })
      };
        
    login(username: string, password: string) {


        return this.http.post<any>(this.baseUrlCIServer, { client_email: username, client_password: password },this.httpOptions)



        .pipe(map(user => {
            // login successful if there's a jwt token in the response
            if(user && user.success){
                console.log(user.message);
               
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                // localStorage.setItem('tokenObject', JSON.stringify(user.object));
            }
            return user;
        }));
    }
    
    logout() {
        // remove user from local storage to log user out
        // localStorage.removeItem('tokenObject');
        sessionStorage.clear();
    }
}