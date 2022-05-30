import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Services
import { UserService } from 'src/app/services/user.service';

// Models
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  async signup(name: string, surname: string, email: string, password: string, confirmPassword: string, form: any) {
    // Comprobar que los datos requeridos del formulario han sido rellenados
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Comprobar que coincidan las contraseñas
    if (password != confirmPassword) {
      return;
    }

    // Eliminar los espacios no deseados en los inputs
    let cleanName = name.replace(/\s+/g,' ').trim();
    let cleanSurname = surname.replace(/\s+/g,' ').trim();
    let cleanEmail = email.replace(/\s+/g,'').trim().toLowerCase();
    
    // Nuevo objeto User
    let newUser: User = {
      name: cleanName,
      surname: cleanSurname,
      email: cleanEmail,
      password: password,
      verified: false,
      projects: []
    }

    // Se comprobará si el email existe en la bdd
    try {
      let res = await lastValueFrom(this.userService.signup(newUser));
      console.log(res);
      this.router.navigate(['/login']);
    }
    catch (error) {
      console.log(error)
    }
  }

  ngOnInit(): void {
  }

}
