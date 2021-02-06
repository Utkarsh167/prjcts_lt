import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
    constructor(private http: HttpClient) { }
    public give() {
        if (localStorage.getItem('currentUser')) {
            return true;
        } else {
            return false;
        }
    }
        
    login(username: string, password: string) {

        return this.http.post<any>(`http://13.126.106.225/feediback-backend/admin-panel/api/check_user.php`, { client_email: username, client_passwd: password })



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