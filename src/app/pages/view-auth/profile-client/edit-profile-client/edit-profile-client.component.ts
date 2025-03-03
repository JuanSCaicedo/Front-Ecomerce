import { Component, EventEmitter, Output } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-edit-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-client.component.html',
  styleUrl: './edit-profile-client.component.css'
})
export class EditProfileClientComponent {

  private isProcessing = new BehaviorSubject<boolean>(false);
  @Output() user = new EventEmitter<any[]>(); // Para un array de cualquier tipo de datos

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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Edit Profile");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Edit Profile");
      });

      return true;
    }

    return false;
  }

  name: string = '';
  surname: string = '';
  email: string = '';
  phone: string = '';
  bio: string = '';
  fb: string = '';
  tw: string = '';
  sexo: string = '';
  description: string = '';
  address_city: string = '';
  file_imagen: any;
  imagen_previsualiza: any;

  constructor(
    public profileClient: ProfileClientService,
    public toastr: ToastrService,
    public authService: AuthService,
    public cartService: CartService,
    public homeService: HomeService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.showUser();
  }

  ngAfterViewInit() {
    this.cargarEstilosSelected();
  }

  updateProfile() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      this.router.navigateByUrl('/login');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Registrar Dirección");
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


    if (!this.name || !this.email) {
      this.toastr.error("Los campos de nombre y correo electrónico son obligatorios", "Validación");
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Procesando solicitud", "Actualización de perfil");
    }

    let formData = new FormData();
    formData.append("name", this.name);
    formData.append("surname", this.surname);
    formData.append("email", this.email);
    if (this.phone) {
      formData.append("phone", this.phone);
    }
    if (this.bio) {
      formData.append("bio", this.bio);
    }
    if (this.fb) {
      formData.append("fb", this.fb);
    }
    if (this.tw) {
      formData.append("tw", this.tw);
    }
    if (this.sexo) {
      formData.append("sexo", this.sexo);
    }
    if (this.address_city) {
      formData.append("address_city", this.address_city);
    }

    if (this.file_imagen) {
      formData.append("file_imagen", this.file_imagen);
    }

    this.profileClient.updateProfile(formData)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          if (resp.message == 403) {
            this.toastr.error(resp.message_text, "Validación");
          } else {
            this.toastr.success("Perfil actualizado correctamente", "Éxito");
            this.showUser();
          }
        }),
        finalize(() => {
          // Finaliza el estado de procesamiento
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
          if (error.status == 401) {
            this.authService.sessionExpired();
            this.router.navigateByUrl('/login');
            this.cartService.clearCart();
          } else if (error.status == 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else if (error.status == 429) {
            this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
            return;
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuníquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }

  showUser() {
    this.profileClient.showUsers().subscribe((resp: any) => {
      console.log(resp);
      this.name = resp.name
      this.surname = resp.surname
      this.email = resp.email
      this.phone = resp.phone
      this.bio = resp.bio
      this.fb = resp.fb
      this.tw = resp.tw
      this.sexo = resp.sexo || ""
      this.address_city = resp.address_city
      this.imagen_previsualiza = resp.avatar
      this.user.emit(resp);

      // Después de un breve retraso para asegurar que Angular ha actualizado el DOM
      setTimeout(() => {
        // Actualizamos NiceSelect para que refleje el nuevo valor
        $('.profile__area select').niceSelect('update');
      }, 100);
    }, (error) => {
      // Manejo de errores según el código de estado
      if (error.status == 401) {
        this.authService.sessionExpired();
        this.router.navigateByUrl('/login');
        this.cartService.clearCart();
      } else if (error.status == 503) {
        this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
      } else if (error.status == 429) {
        this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
        return;
      }
      else {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    });
  }

  cargarEstilosSelected() {
    // Inicializar NiceSelect
    $('.profile__area select').niceSelect();

    // Agregar listener para clicks en las opciones
    $(document).on('click', '.nice-select .option', () => {
      setTimeout(() => {
        const originalSelectValue = $('select[name="sexo"]').val();
        this.sexo = originalSelectValue;
      }, 100);
    });
  }

  processFile($event: any) {
    if ($event.target.files[0].type.indexOf("image") < 0) {
      this.toastr.error("El archivo seleccionado no es una imagen", "Error de archivo");
      return;
    }
    this.file_imagen = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.file_imagen);
    reader.onloadend = () => this.imagen_previsualiza = reader.result;
  }
}
