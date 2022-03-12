import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

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
    this.uid = '';
    this.cookieService.deleteAll();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.uid = this.cookieService.get('uid');
  }
}
