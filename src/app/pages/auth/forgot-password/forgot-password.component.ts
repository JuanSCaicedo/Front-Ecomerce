import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, CodeForgotPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  
}
