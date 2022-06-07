import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-confirmation-account',
  templateUrl: './confirmation-account.component.html',
  styleUrls: ['./confirmation-account.component.css']
})
export class ConfirmationAccountComponent implements OnInit {
  token: any = '';
  userId: string = '';

  constructor(private userService: UserService, private route: ActivatedRoute, private cookieService: CookieService, private router: Router) { }

  async ngOnInit() {
    this.userId = this.cookieService.get('uid');

    // Si no ha usuario, volvemos a home y return
    if (this.userId) {
      return this.router.navigate(['/']);
    }

    this.getToken();

    await lastValueFrom(this.userService.confirmEmail(this.token));

    return;
  }

  getToken() {
    this.token = this.route.snapshot.paramMap.get('token');
  }

}
