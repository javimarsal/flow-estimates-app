import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private cookieService: CookieService) { }

  async signin(email: string, password: string, form: any) {
    // Comprobar que los datos requeridos del formulario han sido rellenados
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return
    }

    try {
      let user = await lastValueFrom(this.userService.signin(email, password));

      // set cookie uid
      this.setCookie(user._id);
        
      // las credenciales coinciden, navegamos al proyecto abierto de user
      if (user.openedProject) {
        this.router.navigate([`/project/${user.openedProject}`]);
      }
      else {
        // el usuario no todavía no ha abierto ningún proyecto
        this.router.navigate(['/my-projects']);
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  setCookie(value: string) {
    this.cookieService.set('uid', value);
  }

  ngOnInit(): void {
  }

}
