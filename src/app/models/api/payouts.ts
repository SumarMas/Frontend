export interface PayoutDto {
    payout_request_id: string;
    ngo_id:            string;
    amount:            number;
    status:            string;
    proof_file_id:     null;
    request_datetime:  Date;
    approval_datetime: null;
    donations:         Donation[];
}

export interface Donation {
    payout_request_id: string;
    donation_id:       string;
    campaign_id:       string;
    amount:            number;
}
