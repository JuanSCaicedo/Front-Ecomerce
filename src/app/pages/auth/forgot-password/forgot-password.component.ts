import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { NewPasswordComponent } from '../new-password/new-password.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  isLoadingMail: any = null;
  isLoadingCode: any = null;
}
