import { Component, EventEmitter, Output } from '@angular/core';
import { ProfileClientService } from '../service/profile-client.service';
import { AuthService } from '../../../auth/service/auth.service';
import { CartService } from '../../../home/service/cart.service';
import { HomeService } from '../../../home/service/home.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';

@Component({
  selector: 'app-orders-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-profile-client.component.html',
  styleUrl: './orders-profile-client.component.css'
})
export class OrdersProfileClientComponent {

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
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Rate Limit");

      // Programar el desbloqueo
      timer(this.BLOCK_DURATION).subscribe(() => {
        this.isBlocked = false;
        this.attemptCount = 0;
        this.toastr.info("Ya puedes volver a agregar productos al carrito", "Desbloqueo Rate Limit");
      });

      return true;
    }

    return false;
  }

  sales: any = [];
  selectedSaleId: number | null = null; // Variable para almacenar la venta activa
  currentPage: number = 1; // Página actual
  totalPages: number = 1; // Total de páginas
  @Output() totalOrders = new EventEmitter<number>();
  ordersTotal: number = 1;
  sale_detail_review: any;
  rating: number = 0;
  message: string = '';

  constructor(
    public profileCliente: ProfileClientService,
    public authService: AuthService,
    public cartService: CartService,
    public homeService: HomeService,
    public toastr: ToastrService,
  ) {
    this.showOrders();
  }

  ngOnInit() {
    this.scrollToUp(); // Realiza scroll hacia arriba apenas inicia la carga de la
  }

  scrollToUp() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);

  }

  showOrders(page: number = 1) {
    this.currentPage = page; // Actualizar la página actual

    this.profileCliente.showOrders(page).subscribe((resp: any) => {
      console.log(resp);
      this.scrollToUp(); // Realiza scroll hacia arriba apenas inicia la carga de la
      this.sales = resp.sales.data;
      this.totalPages = Math.ceil(resp.total / 10); // Calculamos el total de páginas

      // Actualiza el total de órdenes y emite el valor
      this.ordersTotal = resp.total; // O utiliza resp.sales.total dependiendo de tu API
      this.totalOrders.emit(this.ordersTotal);
    }, (error) => {
      this.handleError(error);
    });
  }

  detailShow(sale: any) {
    if (this.selectedSaleId === sale.id) {
      this.selectedSaleId = null; // Si es el mismo, lo oculta
    } else {
      this.selectedSaleId = sale.id; // Asigna el nuevo ID para mostrar su detalle
    }
  }

  reviewShow(sale_detail: any) {
    this.sale_detail_review = sale_detail;
    this.scrollToUp();

    if (this.sale_detail_review.review) {
      this.rating = this.sale_detail_review.review.rating;
      this.message = this.sale_detail_review.review.message;
    }
  }

  selectedRating(val: number) {
    this.rating = val;
  }

  backList() {
    this.sale_detail_review = null;
    this.rating = 0;
    this.message = '';
  }

  saveReview() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Registro de reseña");
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

    // Inicia el estado de procesamiento
    if (!this.message || !this.rating) {
      this.toastr.error("Necesitas calificar y dejar un mensaje para enviar la reseña", "Validación");
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Procesando solicitud", "Registro de reseña");
    }

    let data = {
      product_id: this.sale_detail_review.product_id,
      sale_detail_id: this.sale_detail_review.id,
      message: this.message,
      rating: this.rating
    };

    if (this.sale_detail_review.review) {
      this.profileCliente.updateReview(this.sale_detail_review.review.id, data)
        .pipe(
          tap((resp: any) => {
            console.log(resp);
            this.toastr.success('Reseña actualizada con éxito', 'Actualización de reseña');
            this.sale_detail_review.review = resp.review;
          }),
          finalize(() => {
            // Finaliza el estado de procesamiento
            this.isProcessing.next(false);
          })
        )
        .subscribe({
          next: () => { },
          error: (error) => {
            this.handleError(error);
          }
        });
    } else {
      this.profileCliente.registerReview(data)
        .pipe(
          tap((resp: any) => {
            console.log(resp);
            this.toastr.success('Reseña registrada con éxito', 'Registro de reseña');
            this.sale_detail_review.review = resp.review;
          }),
          finalize(() => {
            // Finaliza el estado de procesamiento
            this.isProcessing.next(false);
          })
        )
        .subscribe({
          next: () => { },
          error: (error) => {
            this.handleError(error);
          }
        });
    }
  }

  // Manejo de errores reutilizable
  handleError(error: any) {
    if (error.status == 401) {
      this.authService.sessionExpired();
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
}
