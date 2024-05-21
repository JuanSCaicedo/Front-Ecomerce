import { Component, Input } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  new_password!: string;
  new_password2!: string;
  isLoadingCode!: any;
  @Input() code: any;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    setTimeout(() => {
      password_show_toggle();
      password_show_toggle2();
    }, 50);
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
    });
  }
}
