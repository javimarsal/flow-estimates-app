import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  title = 'Flow Estimates';
  uid = '';

  constructor(private cookieService: CookieService, private router: Router) {}

  async signOut() {
    this.cookieService.deleteAll();
    // si se elimina la cookie uid, borramos el valor de la variable
    if (this.cookieService.get('uid').length == 0) {
      this.uid = '';
    }
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.uid = this.cookieService.get('uid');
  }
}
