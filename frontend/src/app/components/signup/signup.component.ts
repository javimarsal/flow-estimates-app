import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

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
      projects: []
    }

    // Se comprobará si el email existe en la bdd
    await this.userService.signup(newUser).toPromise()
      .then(res => {
        console.log(res);
        this.router.navigate(['/login']);
      })
      .catch(error => console.log(error));
  }

  ngOnInit(): void {
  }

}