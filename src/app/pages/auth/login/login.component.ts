import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email!: string;
  password!: string;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    // this.showSuccess();
    if (this.authService.token && this.authService.user) {
      setTimeout(() => {
        this.router.navigateByUrl("/")
      }, 500);
      return;
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }
    this.authService.login(this.email, this.password).subscribe((resp: any) => {
      console.log(resp);

      if (resp.error && resp.error.error) {
        this.toastr.error("Error", 'Las credenciales son incorrectas');
        return;
      }

      if (resp == true) {
        this.toastr.success("Éxito", 'Bienvenido a la tienda');
        setTimeout(() => {
          this.router.navigateByUrl("/")
        }, 500);
      }
    }, (error) => {
      console.log(error);
    })
  }

  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
