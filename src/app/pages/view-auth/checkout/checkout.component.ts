import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { AuthService } from '../../auth/service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, finalize, tap, timer } from 'rxjs';
import { HomeService } from '../../home/service/home.service';
import { UserAddressService } from '../service/user-address.service';
import { CommonModule } from '@angular/common';
declare function checkout([]): any;
declare var $: any;
declare var paypal: any;
declare var MercadoPago: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  @ViewChild('billingDetails') billingDetails?: ElementRef;
  @ViewChild('paypal', { static: true }) paypalElement?: ElementRef;

  selectedPayment: string = '';
  PREFERENCE_ID: string = '';

  listCart: any = [];
  totalCarts: number = 0;
  currency: string = 'COP';
  code_cupon: string = '';

  address_list: any = [];
  address_selected: any;

  name: string = '';
  surname: string = '';
  company: string = '';
  country_region: string = '';
  city: string = '';
  address: string = '';
  street: string = '';
  postcode_zip: string = '';
  phone: string = '';
  email: string = '';
  description: string = '';

  private isProcessing = new BehaviorSubject<boolean>(false);
  private attemptCount = 0;
  private isBlocked = false;
  private lastAttemptTime = Date.now();
  private readonly ATTEMPT_THRESHOLD = 20; // Número máximo de intentos
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
        this.toastr.info("Se ha desbloqueado el sistema", "Desbloqueado - Rate Limit");
      });

      return true;
    }

    return false;
  }

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    public addressService: UserAddressService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private homeService: HomeService,
    public router: Router,
  ) {
    this.listarDirecciones();
  }

  ngOnInit() {
    this.iniciarProyecto();
    this.carritoCompra();
    this.paypalPayment();
  }

  iniciarProyecto() {
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'COP';
    this.scrollToUp();
    // Inicializa el script de checkout
    checkout($);
    this.mercadoPagoPayment();
  }

  scrollToUp() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);

  }

  scrolltoBillingDetails() {
    if (this.billingDetails) {
      this.billingDetails.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  carritoCompra() {
    this.cartService.currentDataCart$.subscribe((resp: any) => {
      this.listCart = resp;
      this.totalCarts = this.listCart.reduce((sum: number, item: any) => sum + item.total, 0);
    }, (error) => {
      console.log(error);
      if (error.status == 401) {
        this.authService.sessionExpired();
        this.cartService.clearCart();
      } else {
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    });
  }

  appyCupon() {

    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
      return;
    }

    // Verificar si está bloqueado
    if (this.isBlocked) {
      this.toastr.error("Has realizado demasiados intentos. Por favor, espera 10 segundos.", "Bloqueado - Aplicar Cupón");
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

    if (!this.code_cupon) {
      this.toastr.error("El código del cupón no puede estar vacío", "Validación");
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Aplicando cupón, espere...", "Aplicando cupón");
    }

    let data = {
      code_cupon: this.code_cupon
    };

    this.cartService.applyCupon(data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          if (resp.message == 403) {
            this.toastr.error(resp.message_text, "Validación");
            return;
          } else {
            this.toastr.info(resp.message_text, "Cupón aplicado correctamente");
            this.cartService.resetCart();
            this.cartService.listCart().subscribe((resp: any) => {
              if (resp.carts.data.length > 0) {
                resp.carts.data.forEach((cart: any) => {
                  this.cartService.changeCart(cart);
                });
              } else {
                this.cartService.clearCart();
              }
            }, (error) => {
              // Manejo de errores según el código de estado
              if (error.status == 401) {
                this.authService.sessionExpired();
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
        }),
        finalize(() => {
          // Marcar como no procesando al finalizar
          this.isProcessing.next(false);
        })
      )
      .subscribe({
        next: () => { },
        error: (error) => {
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
            this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }

  listarDirecciones() {
    this.addressService.listAddress().subscribe((resp: any) => {
      console.log(resp);
      this.address_list = resp.address;
    }, (error) => {
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
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
    });
  }

  registerAddress() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
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


    if (!this.name || !this.surname || !this.company || !this.country_region || !this.city || !this.address || !this.street || !this.postcode_zip || !this.phone || !this.email) {
      this.toastr.error('Todos los campos son obligatorios', 'Validación');
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Registrando dirección, espere...", "Registrando dirección");
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email
    }

    this.addressService.registerAddress(data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          this.toastr.success("Dirección registrada correctamente", "Éxito");
          this.resetAddress();
          this.scrollToUp();
          this.address_list.unshift(resp.addres);
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
            this.cartService.clearCart();
          } else if (error.status == 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else if (error.status == 429) {
            this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
            return;
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }

  selectedAddress(addres: any) {
    this.scrolltoBillingDetails();

    this.address_selected = addres;

    this.name = this.address_selected.name;
    this.surname = this.address_selected.surname;
    this.company = this.address_selected.company;
    this.country_region = this.address_selected.country_region;
    this.city = this.address_selected.city;
    this.address = this.address_selected.address;
    this.street = this.address_selected.street;
    this.postcode_zip = this.address_selected.postcode_zip;
    this.phone = this.address_selected.phone;
    this.email = this.address_selected.email;
  }

  resetAddress() {
    this.scrolltoBillingDetails();
    this.address_selected = null;
    this.name = '';
    this.surname = '';
    this.company = '';
    this.country_region = '';
    this.city = '';
    this.address = '';
    this.street = '';
    this.postcode_zip = '';
    this.phone = '';
    this.email = '';
  }

  editAddress() {
    let token = localStorage.getItem('token');

    if (!token) {
      this.toastr.error('No se encuentra la sesión activa', 'Error de autenticación');
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


    if (!this.name || !this.surname || !this.company || !this.country_region || !this.city || !this.address || !this.street || !this.postcode_zip || !this.phone || !this.email) {
      this.toastr.error('Todos los campos son obligatorios', 'Validación');
      this.isProcessing.next(false);
      return;
    } else {
      this.toastr.info("Actualizando dirección, espere...", "Actualizando dirección");
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email
    }

    this.addressService.updateAddress(this.address_selected.id, data)
      .pipe(
        tap((resp: any) => {
          console.log(resp);
          this.toastr.success("Dirección actualizada correctamente", "Éxito");
          this.scrolltoBillingDetails();

          let INDEX = this.address_list.findIndex((item: any) => item.id == resp.addres.id);

          if (INDEX != -1) {
            this.address_list[INDEX] = resp.addres;
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
            this.cartService.clearCart();
          } else if (error.status == 503) {
            this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
          } else if (error.status == 429) {
            this.toastr.error("Demasiadas solicitudes. Por favor, espere unos segundos.", "Error de solicitud");
            return;
          } else {
            console.log(error);
            this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
          }
        }
      });
  }

  paypalPayment() {
    paypal.Buttons({
      style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
      },

      createOrder: (data: any, actions: any) => {
        if (this.totalCarts == 0 || this.listCart.length == 0) {
          this.toastr.error('No se puede realizar la compra con el carrito vacío', 'Error');
          return;
        }

        if (!this.name || !this.surname || !this.company || !this.country_region || !this.city || !this.address || !this.street || !this.postcode_zip || !this.phone || !this.email) {
          this.toastr.error('Todos los campos de la dirección son obligatorios', 'Validación');
          this.isProcessing.next(false);
          return;
        }

        const createOrderPayload = {
          purchase_units: [
            {
              amount: {
                description: "COMPRAR POR EL ECOMMERCE 2025",
                value: this.totalCarts,
              }
            }
          ]
        };

        return actions.order.create(createOrderPayload);
      },

      onApprove: async (data: any, actions: any) => {
        // Mostrar la alerta de procesamiento y guardar su referencia
        this.isProcessing.next(true);
        const processingToast = this.toastr.info("Procesando pago, espere...", "Procesando pago", { disableTimeOut: true });

        try {
          let Order = await actions.order.capture();

          let dataSale = {
            method_payment: 'PAYPAL',
            currency_total: this.currency,
            currency_payment: 'USD',
            discount: 0,
            subtotal: this.totalCarts,
            total: this.totalCarts,
            price_dolar: 0,
            n_transaccion: Order.purchase_units[0].payments.captures[0].id,
            description: this.description,
            sale_address: {
              name: this.name,
              surname: this.surname,
              company: this.company,
              country_region: this.country_region,
              city: this.city,
              address: this.address,
              street: this.street,
              postcode_zip: this.postcode_zip,
              phone: this.phone,
              email: this.email,
            }
          };

          this.cartService.checkout(dataSale)
            .pipe(
              tap((resp: any) => {
                console.log(resp);
                this.toastr.clear(processingToast.toastId); // Cerrar la alerta de procesamiento
                this.toastr.success("Compra realizada correctamente", "Éxito");
                this.router.navigateByUrl("/gracias-por-tu-compra/" + Order.purchase_units[0].payments.captures[0].id);
              }),
              finalize(() => {
                this.isProcessing.next(false);
              })
            )
            .subscribe({
              next: () => { },
              error: (error) => {
                this.toastr.clear(processingToast.toastId); // Cerrar la alerta de procesamiento en caso de error
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
                  this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
                }
              }
            });
        } catch (err) {
          this.toastr.clear(processingToast.toastId); // Cerrar la alerta en caso de error general
          this.isProcessing.next(false);
          console.error('An error prevented the buyer from checking out with PayPal', err);
        }
      },

      onError: (err: any) => {
        this.isProcessing.next(false);
        console.error('An error prevented the buyer from checking out with PayPal', err);
      }
    }).render(this.paypalElement?.nativeElement);
  }

  mercadoPagoInit(resp: any) {
    const mp = new MercadoPago('TEST-b28066a1-3cc1-4e2b-ba1b-f3b111bf32b7', { locale: 'es_CO' });
    const bricksBuilder = mp.bricks();

    this.PREFERENCE_ID = resp.preference.id;

    mp.bricks().create("wallet", "wallet_container", {
      initialization: {
        preferenceId: this.PREFERENCE_ID,
      },
      customization: {
        texts: {
          valueProp: 'smart_option',
        },
      },
    });
  }

  mercadoPagoPayment() {
    this.cartService.mercadopago().pipe(
      tap((resp: any) => {
        console.log(resp);
        this.mercadoPagoInit(resp);
      }),
      finalize(() => {
        this.isProcessing.next(false);
      })
    ).subscribe({
      next: () => { },
      error: (error) => {
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
          this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
        }
      }
    });
  }
}