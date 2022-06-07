import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Models
import { User } from 'src/app/models/user';

// Services
import { CookieService } from 'ngx-cookie-service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  title = 'Flow Estimates';
  uid = '';
  user!: User;

  constructor(private cookieService: CookieService, private router: Router, private userService: UserService) {}
  
  async ngOnInit() {
    this.uid = this.cookieService.get('uid');
  }

  async getUser() {
    if (!this.uid) return;
    this.user = await lastValueFrom(this.userService.getUser(this.uid));
  }

  async signOut() {
    this.cookieService.deleteAll();
    // si se elimina la cookie uid, borramos el valor de la variable
    if (this.cookieService.get('uid').length == 0) {
      this.uid = '';
    }
    await this.router.navigate(['/']);
  }

  async brandLink() {
    // Si no hay usuario, volvemos a home
    if (!this.uid) {
      return this.router.navigate(['/']);
    }

    // Hay usuario
    await this.getUser();
    
    // Si tiene openedProject
    if (this.user.openedProject) {
      // vamos al openedProject de user
      return this.router.navigate([`/project/${this.user.openedProject}`]);
    }

    // Si no tiene openedProject, volvemos a home
    return this.router.navigate(['/']);
  }

}
