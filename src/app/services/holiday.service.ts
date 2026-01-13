import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayDto } from '../models/holiday.model';

export interface ClientResponse<T> {
  data: T;
  message: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private baseUrl = '/api/holiday';

  constructor(private http: HttpClient) { }

 

  getHolidays(shopCode: string): Observable<ClientResponse<HolidayDto[]>> {
    let url = "http://localhost:8080/api/holiday/{shopCode}".replace("{shopCode}", shopCode);
    return this.http.get<ClientResponse<HolidayDto[]>>(url);
  }

  createHoliday(shopCode: string, holiday: HolidayDto): Observable<ClientResponse<HolidayDto>> {
    let url = "http://localhost:8080/api/holiday/{shopCode}".replace("{shopCode}", shopCode);
    return this.http.post<ClientResponse<HolidayDto>>(url, holiday);
  }

  updateHoliday(shopCode: string, holiday: HolidayDto): Observable<ClientResponse<HolidayDto>> {
    let url = "http://localhost:8080/api/holiday/{shopCode}".replace("{shopCode}", shopCode);
    return this.http.put<ClientResponse<HolidayDto>>(url, holiday);
  }

  deleteHoliday(shopCode: string, id: number): Observable<ClientResponse<boolean>> {
    let url = "http://localhost:8080/api/holiday/{shopCode}/{id}".replace("{shopCode}", shopCode).replace("{id}", id.toString());
    return this.http.delete<ClientResponse<boolean>>(url);
  }
  
}