import { Component, afterNextRender } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../home/service/home.service';

declare function password_show_toggle(): any;
declare function password_show_toggle2(): any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  isLoading$: any;

  name!: string;
  surname!: string;
  email!: string;
  password!: string;
  password2!: string;
  phone!: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    public homeService: HomeService
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
        password_show_toggle2();
      }, 50);
    })
  }

  ngOnInit(): void {
    this.isLoading$ = this.authService.isLoading$;

    this.homeService.homeView().subscribe();

    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);
  }

  register() {
    if (
      !this.name ||
      !this.surname ||
      !this.email ||
      !this.password ||
      !this.password2 ||
      !this.phone
    ) {
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }

    if (this.password != this.password2) {
      this.toastr.error("Validación", "Las contraseñas no coinciden");
      return;
    }

    if (this.password.length < 8 || this.password2.length < 8) {
      this.toastr.error("Validación", "Las contraseñas debe contener al menos 8 caracteres");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      password: this.password,
      phone: this.phone
    }
    this.authService.register(data).subscribe((resp: any) => {

      if (resp.message == 'Too Many Attempts. Please Wait 1 Minute') {
        this.toastr.error("Registro fallido", "Demasiados intentos. Por favor espera 1 minuto");
      } else {
        if (resp.error) {
          this.toastr.error("Registro fallido", "Usuario no disponible");
        } else {
          this.toastr.success("Éxito", "Confirma tu correo para continuar con el registro");
          setTimeout(() => {
            this.router.navigateByUrl("/login");
          }, 500);
        }
      }
    });
  }
}