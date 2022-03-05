import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor() { }

  signin(event: any, name: string, password: string, form: any) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return false;
    }
    return true
  }

  ngOnInit(): void {
  }

}
