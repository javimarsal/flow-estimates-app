import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  URL_API = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) { }

  signin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.URL_API}/signin`, {email: email, password: password});
  }
}
