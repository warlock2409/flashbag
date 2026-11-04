import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServiceResponse } from '../app.component';
import { BoosterPlanDto } from '../models/booster.model';

@Injectable({
  providedIn: 'root'
})
export class BoosterService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:8080';

  /**
   * Fetch active booster plan for a given membership plan ID.
   * GET /plan/{membershipPlanId} (supports /api/booster/plan/{membershipPlanId} or /plan/{membershipPlanId})
   */
  getBoosterPlan(membershipPlanId: number): Observable<ServiceResponse<BoosterPlanDto>> {
    const primaryUrl = `${this.baseUrl}/api/booster/plan/${membershipPlanId}`;
    const fallbackUrl1 = `${this.baseUrl}/booster/plan/${membershipPlanId}`;
    const fallbackUrl2 = `${this.baseUrl}/plan/${membershipPlanId}`;

    return this.http.get<ServiceResponse<BoosterPlanDto>>(primaryUrl).pipe(
      catchError(() => this.http.get<ServiceResponse<BoosterPlanDto>>(fallbackUrl1)),
      catchError(() => this.http.get<ServiceResponse<BoosterPlanDto>>(fallbackUrl2))
    );
  }

  /**
   * Create or update booster plan for a given membership plan ID.
   * PUT /plan/{membershipPlanId} (supports /api/booster/plan/{membershipPlanId} or /plan/{membershipPlanId})
   */
  upsertBoosterPlan(membershipPlanId: number, dto: BoosterPlanDto): Observable<ServiceResponse<BoosterPlanDto>> {
    const primaryUrl = `${this.baseUrl}/api/booster/plan/${membershipPlanId}`;
    const fallbackUrl1 = `${this.baseUrl}/booster/plan/${membershipPlanId}`;
    const fallbackUrl2 = `${this.baseUrl}/plan/${membershipPlanId}`;

    return this.http.put<ServiceResponse<BoosterPlanDto>>(primaryUrl, dto).pipe(
      catchError(() => this.http.put<ServiceResponse<BoosterPlanDto>>(fallbackUrl1, dto)),
      catchError(() => this.http.put<ServiceResponse<BoosterPlanDto>>(fallbackUrl2, dto))
    );
  }
}
