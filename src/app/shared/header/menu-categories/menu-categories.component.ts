import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HomeService } from '../../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  ) {
    //Para solucionar bug de no ver menu en mobile se elimino afterNextRender
    this.homeService.menu().subscribe(
      (resp: any) => {
        // console.log(resp);
        this.categories_menus = resp.categories_menus;
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          'API Response - Comuniquese con el desarrollador',
          error.error.message || error.message
        );
      }
    );
  }
}
