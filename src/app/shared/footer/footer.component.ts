import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(private router: Router) { }

  navigateToHome() {
    if (this.router.url === '/') {
      // Si ya estás en el home, desplázate hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si no estás en el home, redirige al home
      this.router.navigate(['/']);
    }
  }
}
