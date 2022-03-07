import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/services/user.service';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  uid: string = '';
  userProjects: any[] = [];

  constructor(private userService: UserService, private cookieService: CookieService) { }

  getUserProjects() {
    this.userService.getUser(this.uid).toPromise()
      .then(user => {
        this.userProjects = user.projects;
        console.log(this.userProjects)
      })
      .catch(error => console.log(error));
  }

  ngOnInit(): void {
    this.uid = this.cookieService.get('uid')
    this.getUserProjects();
  }



}
