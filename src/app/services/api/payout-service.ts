import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, pipe, tap } from 'rxjs';
import { PayoutDto } from '../../models/api/payouts';
import { environment } from '../../../environments/environment';

export enum DonationStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

export enum CampaignState {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
}

export interface UserDto {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    profileFileId: string;
    status: string;
    roles: string[];
}

export interface NgoImageDto {
    imageId: string;
    orderIndex: number;
}

export interface NgoDto {
    ngoId: string;
    userCreator: UserDto;
    name: string;
    description: string;
    profileFileId: string;
    bannerFileId: string;
    documentsId: string[];
    images: NgoImageDto[];
    status: string;
    createdDateTime: string;
}

export interface CategoryDto {
    id: string;
    name: string;
    description: string;
}

export interface DonationDto {
    donation_id: string;
    campaign_id: string;
    donor_id: string;
    payment_id: string;
    payment_proof: string;
    amount: number;
    currency: string;
    status: DonationStatus;
    payment_method: string;
    payment_datetime: string;
}

export interface AvailableDonationDto {
    id: string;
    ngo: NgoDto;
    title: string;
    goal_amount: number;
    current_amount: number;
    description: string;
    end_date_time: string;
    create_date_time: string;
    campaign_state: CampaignState;
    categories: CategoryDto[];
    tags: string[];
    images: string[];
    donations: DonationDto[];
}

export interface PayoutResponse {
    campaigns: {
        id: string;
        name: string;
        goal: number;
        totalDonations: number; 
        totalReceipt: number;
    }[]
    totalAvailable: number;
}

@Injectable({ providedIn: 'root' })
export class PayoutService {
    private apiUrl = `${environment.apiBaseUrl}/payouts/api/v1/payouts`;

    http = inject(HttpClient);

    /**
     * Lista todas las solicitudes de pago de una NGO específica, PENDING O PAID
     * @param ngoId 
     * @returns Observable<PayoutDto[]>
     */
    getPayoutsByNgoId(ngoId: string): Observable<PayoutDto[]> {
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
    approvePayout(payoutId: string, file_id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${payoutId}/approve`, { file_id });
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
    postRequest(): Observable<PayoutDto> {
        return this.http.post<PayoutDto>(`${this.apiUrl}/request`, {});
    }

    /**     * Obtiene una solicitud de pago por su ID
     * @param payoutId id de la solicitud de pago
     * @returns Observable<PayoutDto>
     */
    payoutById(payoutId: string): Observable<PayoutDto> {
        return this.http.get<PayoutDto>(`${this.apiUrl}/${payoutId}`);
    }

    /**
     * Trae las donaciones disponibles para solicitar un pago
     * @returns Observable<PayoutResponse>
     */
    getAvailableDonations(): Observable<PayoutResponse> {
        return this.http.get<AvailableDonationDto[]>(`${this.apiUrl}/available-donations`).pipe(
            tap(data => console.log('Available donations data:', data)),
            map(campaigns => {
                if (!campaigns || campaigns.length === 0) {
                    return {
                        campaigns: [],
                        totalAvailable: 0
                    };
                }

                const mappedCampaigns = campaigns.map(donation => ({
                    id: donation.id,
                    name: donation.title,
                    goal: donation.goal_amount,
                    totalDonations: donation.donations.length,
                    totalReceipt: donation.current_amount
                }));

                const totalAvailable = campaigns.reduce((sum, campaign) => sum + campaign.current_amount, 0);

                return {
                    campaigns: mappedCampaigns,
                    totalAvailable
                };
            })
        );
    }
}