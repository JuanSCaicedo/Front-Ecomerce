import { Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { ToastrService } from 'ngx-toastr';
import { SliderComponent } from './slider/slider.component';
import { CategoriesComponent } from './categories/categories.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SliderComponent, CategoriesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private toastr: ToastrService,
    public homeService: HomeService,
  ) {

  }
}