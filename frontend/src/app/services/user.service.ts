import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Models
import { User } from '../models/user';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  URL_API = `${environment.URL_API}/api/users`;

  constructor(private http: HttpClient) { }

  getUser(uid: string): Observable<User> {
    return this.http.get<User>(`${this.URL_API}/${uid}`)
  }

  signin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.URL_API}/signin`, {email: email, password: password});
  }

  signup(user: User) {
    return this.http.post(`${this.URL_API}/signup`, user);
  }

  confirmEmail(token: string) {
    return this.http.get(`${this.URL_API}/confirmation/${token}`);
  }

  setOpenedProject(projectId: string, uid: string) {
    return this.http.post(`${this.URL_API}/openedProject`, {projectId: projectId, uid: uid});
  }

  getProjects(userId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.URL_API}/${userId}/projects`);
  }

  addProject(userId: string, project: Project) {
    return this.http.put(`${this.URL_API}/${userId}/projects`, project);
  }

  deleteProject(userId: string, projectId: string) {
    return this.http.delete(`${this.URL_API}/${userId}/projects/${projectId}`);
  }
}
