import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../pages/navbar/navbar.component';
import { MATERIAL_IMPORTS } from './material.imports';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/spinner.service';
import { Observable, Subscribable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,CommonModule,MATERIAL_IMPORTS],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'valuecorn_frontend';
  
 loading$: Observable<boolean>;
    constructor(private loadingService: LoadingService) {
          this.loading$ = this.loadingService.loading$;

    }


}
