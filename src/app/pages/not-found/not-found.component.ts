import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

  constructor(
    public homeService: HomeService,
  ) { }


  ngOnInit() {
    // Realiza scroll hacia la parte superior de la página
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave hacia arriba
      }
    }, 0);

    this.homeService.homeView().subscribe();
  }
}
