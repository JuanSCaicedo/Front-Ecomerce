import { Component } from '@angular/core';
import { HomeService } from './service/home.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  SLIDER: any = [];

  constructor(
    private toastr: ToastrService,
    public homeService: HomeService,
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