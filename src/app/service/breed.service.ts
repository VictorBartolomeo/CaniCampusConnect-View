
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Breed } from '../models/breed';

@Injectable({
  providedIn: 'root'
})
export class BreedService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les races
   */
  getAllBreeds(): Observable<Breed[]> {
    return this.http.get<Breed[]>(`${this.apiUrl}/breeds`);
  }

  /**
   * Récupère une race par ID
   */
  getBreedById(id: number): Observable<Breed> {
    return this.http.get<Breed>(`${this.apiUrl}/breed/${id}`);
  }

  /**
   * ✨ Récupère l'URL de l'image d'une race
   */
  getBreedImageUrl(breedId: number): string {
    return `${this.apiUrl}/breed/${breedId}/image`;
  }

  /**
   * ✨ Récupère l'URL de l'image d'une race via l'objet Breed
   */
  getBreedImageFromBreed(breed: Breed): string {
    return breed.avatarUrl || this.getBreedImageUrl(breed.id);
  }
}
