import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';
import { ProfileClientService } from '../service/profile-client.service';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-profile-client.component.html',
  styleUrl: './password-profile-client.component.css'
})
export class PasswordProfileClientComponent {

  private isProcessing = new BehaviorSubject<boolean>(false);
  private attemptCount = 0;
  private isBlocked = false;
  private lastAttemptTime = Date.now();
  private readonly ATTEMPT_THRESHOLD = 10; // Número máximo de intentos
  private readonly ATTEMPT_WINDOW = 5000; // Ventana de tiempo para contar intentos (5 segundos)
  private readonly BLOCK_DURATION = 10000; // Duración del bloqueo (10 segundos)

  private checkRateLimit(): boolean {
    const now = Date.now();

    // Resetear contador si ha pasado la ventana de tiempo
    if (now - this.lastAttemptTime > this.ATTEMPT_WINDOW) {
      this.attemptCount = 0;
    }

    this.lastAttemptTime = now;
    this.attemptCount++;

    // Si excede el límite de intentos, activar bloqueo
    if (this.attemptCount >= this.ATTEMPT_THRESHOLD) {
      this.isBlocked = true;
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Cambio de contraseña");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Cambio de contraseña");
      });

      return true;
    }

    return false;
  }

  constructor(
    private profileClient: ProfileClientService,
    private authService: AuthService,
    private cartService: CartService,
    private homeService: HomeService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  password: string = "";
  confirm_password: string = "";
  current_password: string = "";

  updateUser() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      this.router.navigateByUrl('/login');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Cambio de contraseña");
      return;
    }

    // Verificar límite de intentos
    if (this.checkRateLimit()) {
      return;
    }

    // Si ya hay una petición en proceso, no permitir otra
    if (this.isProcessing.value) {
      this.toastr.warning("Por favor espera, procesando solicitud anterior", "Procesando");
      return;
    }

    // Marcar como procesando
    this.isProcessing.next(true);

    if (!this.password || !this.confirm_password || !this.current_password) {
      this.toastr.error('Por favor, complete todos los campos', 'Validación');
      this.isProcessing.next(false);
      return;
    }

    if (this.password !== this.confirm_password) {
      this.toastr.error('Las contraseñas no coinciden', 'Validación');
      this.isProcessing.next(false);
      return;
    }

    this.toastr.info('Procesando solicitud', 'Actualizando perfil');

    let data = {
      current_password: this.current_password, // Enviar la contraseña actual
      password: this.password,
    };

    this.profileClient.updateProfile(data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          this.toastr.success("Contraseña actualizada correctamente", "Éxito");
          this.password = "";
          this.confirm_password = "";
          this.current_password = "";
        }),
        finalize(() => {
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
          if (error.status === 401) {
            this.authService.sessionExpired();
            this.cartService.clearCart();
          } else if (error.status === 403) {
            console.log(error);
            this.toastr.error(error.error.message_text, "Validación");
          }
          else if (error.status === 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else if (error.status === 429) {
            this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
            return;
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuníquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }
}
