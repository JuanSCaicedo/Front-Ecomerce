import { afterNextRender, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HomeService } from '../../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-categories.component.html',
  styleUrl: './menu-categories.component.css'
})
export class MenuCategoriesComponent {

  categories_menus: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.home().subscribe((resp: any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }

  getIconMenu(menu:any) {
    var miDiv: any = document.getElementById('icon-' + menu.id);
    miDiv.innerHTML = menu.icon;
    return '';
  }
}
