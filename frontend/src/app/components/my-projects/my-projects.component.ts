import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  uid: string = '';
  userProjects: any[] = [];

  constructor(private userService: UserService, private cookieService: CookieService) { }

  async getUserProjects() {
    try {
      let user = await lastValueFrom(this.userService.getUser(this.uid));
      this.userProjects = user.projects;
    }
    catch (error) {
      console.log(error)
    }
  }

  ngOnInit(): void {
    this.uid = this.cookieService.get('uid')
    this.getUserProjects();
  }



}
