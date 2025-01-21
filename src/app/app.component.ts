import { Component, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { AppLayoutComponent } from './pages/app-layout/app-layout.component';
import { HomeService } from './pages/home/service/home.service';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';

declare var $: any;
declare function HOMEINIT([]): any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, HeaderComponent, FooterComponent, AppLayoutComponent, MaintenanceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'ecommerce';

  routerSubscription: Subscription = new Subscription();

  sessionTimeoutId: any = null;
  warningTimeoutId: any = null;
  MANTINANCE_STATUS: boolean = false;

  constructor(
    public router: Router,
    private homeService: HomeService
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        HOMEINIT($);
      }, 50);

      $(window).on('load', function () {
        $("#loading").fadeOut(500);
      });
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkSession();
    });
  }

  ngOnInit(): void {
    this.checkSession();
    // Realiza la llamada inicial a homeView() y almacena los datos en el BehaviorSubject
    // Realiza la llamada inicial para llenar el BehaviorSubject

    // Suscríbete al observable para acceder a los datos cuando estén disponibles
    this.homeService.homeViewData$.subscribe((data) => {
      if (data) {
        const vista_mantenimiento = data.home_views.find(
          (view: any) => view.name === 'vista_mantenimiento'
        );
        this.MANTINANCE_STATUS = vista_mantenimiento?.state === 1 ? true : false;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from router events to avoid memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // Clear timeouts to avoid code execution after component destruction
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }
  }

  checkSession(): void {
    if (typeof window !== 'undefined' && window.localStorage
      && localStorage.getItem('user') && localStorage.getItem('token')) {

      // 60000 ms = 1 minute
      // 3600000 ms = 1 hour
      // 10800000 ms = 3 hours
      const timeExp = 10800000;
      const warningTime = 30000; // 2 hours and 55 minutes

      this.sessionTimeoutId = setTimeout(() => {
        this.clearLocalStorage();
        this.router.navigateByUrl("/login");
      }, timeExp);
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
