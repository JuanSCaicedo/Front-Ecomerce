import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './code-forgot-password.component.html',
  styleUrl: './code-forgot-password.component.css'
})
export class CodeForgotPasswordComponent {

  code!: string;
  isLoadingCode!: any;

  @Output() LoadingCodeStatus: EventEmitter<any> = new EventEmitter();

  constructor(
    public authService: AuthService,
    public toastr: ToastrService
  ) { }

  verifiedCode() {
    if (!this.code) {
      this.toastr.error("Validación", "Ingrese el código de verificación");
    } else {

      let data = {
        code: this.code,

      }

      this.authService.verifiedCode(data).subscribe((resp: any) => {
        console.log(resp);
        if (resp.message == 200) {
          this.isLoadingCode = 1;
          const timestamp = new Date().getTime();
          localStorage.setItem('isLoadingCode', JSON.stringify({ value: '1', timestamp: timestamp }));
          
          this.LoadingCodeStatus.emit(this.isLoadingCode);
          this.toastr.success("Éxito", "Código confirmado correctamente");
        } else if (resp.message == 403) {
          this.isLoadingCode = null;
          localStorage.removeItem('isLoadingCode');
          this.toastr.error("Validación", "Código no existe");
        } else if (resp.message == 401) {
          this.isLoadingCode = null;
          localStorage.removeItem('isLoadingCode');
          this.toastr.error("Validación", "Código ha expirado");
        }
      })
    }
  }

  ngOnInit() {
    const storedIsLoadingCode = localStorage.getItem('isLoadingCode'); // Recuperar el valor de localStorage
    this.isLoadingCode = storedIsLoadingCode ? parseInt(storedIsLoadingCode) : null;
  }
}
