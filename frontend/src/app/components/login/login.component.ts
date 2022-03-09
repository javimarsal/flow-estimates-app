import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private cookieService: CookieService) { }

  async signin(email: string, password: string, form: any) {
    // Comprobar que los datos requeridos del formulario han sido 
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return
    }

    await this.userService.signin(email, password).toPromise()
      .then(res => {
        // set cookie uid
        this.setCookie(res.user._id);
        
        // las credenciales coinciden, navegamos a /my-projects
        // Ruta registrada en app-routing.module
        this.router.navigate(['/my-projects'])
          .catch(error => console.log(error))
      })
      .catch(error => {
        console.error(error)
      })
    
  }

  setCookie(value: string) {
    this.cookieService.set('uid', value);
  }

  ngOnInit(): void {
  }

}
