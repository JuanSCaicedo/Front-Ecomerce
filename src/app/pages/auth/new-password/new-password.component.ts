import { Component, Input, afterNextRender } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../home/service/home.service';

declare function password_show_toggle(): any;
declare function password_show_toggle2(): any;

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  isLoading$: any;

  new_password!: string;
  new_password2!: string;
  isLoadingCode!: any;
  @Input() code: any;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    public homeService: HomeService
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
        password_show_toggle2();
      }, 50);
    })
  }

  ngOnInit() {
    this.isLoading$ = this.authService.isLoading$;
  }

  verifiedNewPassword() {
    if (
      !this.new_password ||
      !this.new_password2
    ) {
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }

    if (this.new_password != this.new_password2) {
      this.toastr.error("Validación", "Las contraseñas no coinciden");
      return;
    }

    let data = {
      new_password: this.new_password,
      code: this.code,
    }

    this.authService.verifiedNewPassword(data).subscribe((resp: any) => {
      console.log(resp);
      localStorage.removeItem('isLoadingMail');
      localStorage.removeItem('isLoadingCode');
      this.toastr.success("exito", "La contraseña se ha cambiado correctamente");
      this.router.navigateByUrl("/login");
    }, (error) => {
      if (error.status == 429) {
        this.toastr.error("Validación", "Has excedido el límite de solicitudes. Por favor, intenta de nuevo en un minuto");
      } else if (error.status == 503) {
        this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
      } else {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    });
  }
}
