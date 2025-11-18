export interface GetNotificationDto {
    /** Unique identifier for the notification. (UUID) */
    notification_id: string;
    /** Identifier of the user receiving the notification. (UUID) */
    user_id: string;
    /** Title of the notification. (String) */
    title: string;
    /** Message content of the notification. (String) */
    message: string;
    /** Type of the notification. (NotificationType) */
    type: NotificationType;
    /** Flag indicating whether the notification has been read. (boolean) */
    read: boolean;
    /** LocalDateTime when the notification was created. (Formato: "yyyy-MM-dd HH:mm:ss") */
    createdAt: string;
    /** LocalDateTime when the notification was last updated. (Formato: "yyyy-MM-dd HH:mm:ss") */
    updatedAt: string;
}

export enum NotificationType {
    /** Notification type for user creation events. */
    USER_CREATED,
    /** Notification type for Receiving NGO documents. */
    NGO_DOCUMENTS_RECEIVED,
    /** Notification type for approved NGO documents. */
    NGO_DOCUMENTS_APPROVED,
    /** Notification type for rejected NGO documents. */
    NGO_DOCUMENTS_REJECTED,
    /** Notification type for successful donations. */
    DONATION_SUCCESS,
    /** Notification type for Finalized Campaigns. */
    CAMPAIGN_FINALIZED,
    /** Notification type when Ngo
     * Published Message in Campaigns. */
    NGO_PUBLISHED_MESSAGE,
    /** Notification type for Payout Requests. */
    PAYOUT_REQUESTED,
    /** Notification type for Approved Payouts. */
    PAYOUT_APPROVED
}