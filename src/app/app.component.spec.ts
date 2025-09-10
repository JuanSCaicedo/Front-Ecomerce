import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

// Mock components to avoid complex dependencies in tests
@Component({
  selector: 'app-app-layout',
  template: '<div>Mock app layout</div>'
})
class MockAppLayoutComponent { }

@Component({
  selector: 'app-maintenance',
  template: '<div>Mock maintenance</div>'
})
class MockMaintenanceComponent { }

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule
      ],
      declarations: [
        MockAppLayoutComponent,
        MockMaintenanceComponent
      ]
    }).compileComponents();

    // Mock global functions that aren't available in test environment
    (window as any).$ = () => ({ on: jasmine.createSpy('on'), fadeOut: jasmine.createSpy('fadeOut') });
    (window as any).HOMEINIT = jasmine.createSpy('HOMEINIT');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'ecommerce' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ecommerce');
  });

  it('should render hola greeting when not in maintenance', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.MANTINANCE_STATUS = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hola-greeting h1')?.textContent).toContain('¡Hola! Bienvenido a nuestro ecommerce');
  });

  it('should have maintenance status property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.hasOwnProperty('MANTINANCE_STATUS')).toBe(true);
  });
});
