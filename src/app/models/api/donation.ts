export interface PostDonationDto {
    campaign_id: string;
    amount: number;
    title: string;
}

export interface GetDonationDto {
    donation_id:      string;
    campaign_id:      string;
    donor_id:         string;
    payment_id:       string;
    payment_proof:    string;
    amount:           number;
    currency:         string;
    status:           'CREATED' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | string;
    payment_method:   string;
    payment_datetime: number[] | null;  // Array: [year, month, day, hour, min, sec]
    created_at:       string;           // ISO string: "2025-11-21T22:27:23"
    campaign_data?:   CampaignData;     // Opcional según endpoint
}

export interface CampaignData {
    id:               string;
    ngo:              Ngo;
    title:            string;
    goal_amount:      number;
    current_amount:   number;
    description:      string;
    end_date_time:    Date;
    create_date_time: Date;
    campaign_state:   string;
    categories:       Category[];
    tags:             string[];
    images:           string[];
}

export interface Category {
    id:          string;
    name:        string;
    description: string;
}

export interface Ngo {
    ngoId:           string;
    userCreator:     UserCreator;
    name:            string;
    description:     string;
    profileFileId:   string;
    bannerFileId:    string;
    documentsId:     string[];
    images:          Image[];
    status:          string;
    createdDateTime: Date;
}

export interface Image {
    imageId:    string;
    orderIndex: number;
}

export interface UserCreator {
    userId:        string;
    firstName:     string;
    lastName:      string;
    email:         string;
    profileFileId: null;
    status:        string;
    roles:         string[];
}
