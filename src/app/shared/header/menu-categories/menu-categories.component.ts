import { Component, ElementRef, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HomeService } from '../../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-categories.component.html',
  styleUrl: './menu-categories.component.css'
})
export class MenuCategoriesComponent {

  categories_menus: any[] = [];

  constructor(
    private homeService: HomeService,
    private toastr: ToastrService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
  ) {
    this.callMenu();
  }

  @HostListener('document:click', ['$event'])
  closeMenuWhenClickingOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  closeMenu() {
    $('.tp-category-menu > nav > ul').stop(true, true).slideUp();
  }

  callMenu() {
    //Para solucionar bug de no ver menu en mobile se elimino afterNextRender
    this.homeService.menu().subscribe(
      (resp: any) => {
        // console.log(resp);
        this.categories_menus = resp.categories_menus.map((menu: any) => ({
          ...menu,
          iconHtml: menu.icon ? this.sanitizer.bypassSecurityTrustHtml(menu.icon) : null as SafeHtml | null,
        }));
      },
      (error) => {
        if (error.status === 503) {
          this.homeService.homeView('SYSTEM_MAINTENANCE_ACTIVE').subscribe();
        } else {
          console.log(error);
          this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
        }
      }
    );
  }
}
