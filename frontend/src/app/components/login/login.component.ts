import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  userId: string = '';

  constructor(private userService: UserService, private router: Router, private cookieService: CookieService) { }

  ngOnInit(): void {
    this.userId = this.cookieService.get('uid');

    if (this.userId) {
      this.router.navigate(['/']);
    }
  }

  async signin(email: string, password: string, form: any) {
    // Comprobar que los datos requeridos del formulario han sido rellenados
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return
    }

    try {
      let user: User = await lastValueFrom(this.userService.signin(email, password));

      if (!user) {
        this.changeInnerText('warning', 'El correo o la contraseña son incorrectos.')

        return;
      }

      if (!user.confirmed) {
        this.changeInnerText('warning', 'Debes confirmar tu cuenta antes de iniciar sesión. Comprueba la bandeja de entrada de tu correo electrónico.')
        
        return;
      }
      this.changeInnerText('warning', '');

      // set cookie uid
      this.setCookie(user._id!);
        
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

  changeInnerText(elementId: string, message: string) {
    document.getElementById(elementId)!.innerText = message;
  }

}
