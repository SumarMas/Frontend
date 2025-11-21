import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PayoutDto } from '../../models/api/payouts';

@Injectable({providedIn: 'root'})
export class PayoutService {
    private apiUrl = 'http://sumar-mas.dynns.com:9080/payouts/api/v1/payouts';

    http = inject(HttpClient);

    /**
     * Lista todas las solicitudes de pago de una NGO específica, PENDING O PAID
     * @param ngoId 
     * @returns Observable<PayoutDto[]>
     */
    getPayoutsByNgoId(ngoId: string) : Observable<PayoutDto[]> {
        const url = `${this.apiUrl}/by-ngo/${ngoId}`;
        return this.http.get<PayoutDto[]>(url);
    }

    /**
     * Trae todas las solicitudes de pago de la NGO autenticada
     * @returns Observable<PayoutDto[]>
     */
    getMyPayouts(): Observable<PayoutDto[]> {
        const url = `${this.apiUrl}/my-ngo`;
        return this.http.get<PayoutDto[]>(url);
    }

    /**
     * Aprueba una solicitud de pago y genera el comprobante
     * @param payoutId id de la solicitud de pago
     * @param fileId id del archivo comprobante
     * @returns void
     */
    approvePayout(payoutId: string, file_id: string) : Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${payoutId}/approve`,{file_id});
    }

    /**
     * Lista todas las solicitudes de pago PENDING de todas las NGOs
     * @returns Observable<PayoutDto[]>
     */
    payoutsPending(): Observable<PayoutDto[]> {
        return this.http.get<PayoutDto[]>(`${this.apiUrl}/pending`);
    }

    /**
     * Crea una solicitud de pago para una NGO adjuntando todas las donaciones
     * CONFIRMADAS no pagas de una campaña CERRADA.
     */
    postRequest(): Observable<PayoutDto>{
        return this.http.post<PayoutDto>(`${this.apiUrl}/request`,{});
    }

    /**     * Obtiene una solicitud de pago por su ID
     * @param payoutId id de la solicitud de pago
     * @returns Observable<PayoutDto>
     */
    payoutById(payoutId: string): Observable<PayoutDto>{
        return this.http.get<PayoutDto>(`${this.apiUrl}/${payoutId}`);
    }
}