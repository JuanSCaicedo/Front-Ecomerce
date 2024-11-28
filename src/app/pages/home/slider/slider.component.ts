import { Component } from '@angular/core';
import { HomeService } from '../service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {

  SLIDER: any = [];

  constructor(
    public homeService: HomeService,
    private toastr: ToastrService,
  ) {

  }

  ngOnInit() {
    this.homeService.home().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDER = resp.sliders_principal;
    }, (error) => {
      console.log(error);
      this.toastr.error('API Response - Comuniquese con el desarrollador', error.error.message || error.message);
    }
    );
  }
}
