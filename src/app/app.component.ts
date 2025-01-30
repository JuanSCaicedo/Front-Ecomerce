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
import { ToastrService } from 'ngx-toastr';

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
    private homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      setTimeout(() => {
        HOMEINIT($);
      }, 50);

      $(window).on('load', function () {
        $("#loading").fadeOut(500);
      });
    });
  }

  ngOnInit(): void {
    this.viewMantinance();
  }

  viewMantinance() {
    // Suscríbete al observable para acceder a los datos cuando estén disponibles
    this.homeService.homeViewData$.subscribe((data) => {
      if (data) {
        const vista_mantenimiento = data.home_views.find(
          (view: any) => view.name === 'vista_mantenimiento'
        );
        this.MANTINANCE_STATUS = vista_mantenimiento?.state === 1 ? true : false;
      }
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    });
  }
}
