import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MyProjectsComponent } from '../my-projects/my-projects.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  async signin(event: Event, email: string, password: string, form: any) {
    // Comprobar que los datos requeridos del formulario han sido 
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return
    }

    await this.userService.signin(email, password).toPromise()
      .then(res => {
        console.log(res.message)
        
        // si las credenciales coinciden navegamos a /my-projects
        // Ruta registrada en app-routing.module
        this.router.navigate(['/my-projects'])
          .catch(error => console.log(error))
      })
      .catch(error => {
        console.error(error)
      })
    
  }

  ngOnInit(): void {
  }

}
