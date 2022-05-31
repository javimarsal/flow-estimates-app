import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-confirmation-account',
  templateUrl: './confirmation-account.component.html',
  styleUrls: ['./confirmation-account.component.css']
})
export class ConfirmationAccountComponent implements OnInit {
  token: any = '';

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.getToken();

    await lastValueFrom(this.userService.confirmEmail(this.token));
  }

  getToken() {
    this.token = this.route.snapshot.paramMap.get('token');
  }

}
