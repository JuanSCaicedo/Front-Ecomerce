import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {

      // 60000 ms = 1 minute
      // 3600000 ms = 1 hour
      // 10800000 ms = 3 hours
      const timeExp = 10800000;

      setTimeout(() => {
        this.clearLocalStorage();
      }, timeExp);
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}