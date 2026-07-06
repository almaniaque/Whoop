import { Component } from '@angular/core';
import { StatCard } from './stat-card/stat-card';
import { QuickAccessCard } from './quick-access-card/quick-access-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [RouterLink, StatCard, QuickAccessCard],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil { }
