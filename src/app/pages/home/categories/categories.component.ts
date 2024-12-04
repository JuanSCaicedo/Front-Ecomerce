import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  
  CATEGORIES_RANDOMS: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.categories().subscribe((resp: any) => {
        console.log(resp);
        this.CATEGORIES_RANDOMS = resp.categories_randoms;
      }, (error) => {
        console.log(error);
        this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
      }
      );
    });
  }
}
