/** 
 * Dto para crear una actualización de campaña
 * @property {string} title - Título de la actualización
 * @property {string} description - Descripción de la actualización
 * @property {string} fileId - ID del archivo asociado a la actualización
*/
export interface PostMessageDto {
    title: string;
    description: string;
    fileId?: string;
}

/** 
 * Dto para crear una actualización de campaña
 * @property {string} messageCampaignId - ID de la campaña de mensajes
 * @property {string} title - Título de la actualización
 * @property {string} description - Descripción de la actualización
 * @property {string} fileId - ID del archivo asociado a la actualización
 * @property {string} creationDateTime - Fecha y hora de creación de la actualización
*/
export interface GetMessageDto {
    messageCampaignId: string;
    title: string;
    description: string;
    fileId?: string;
    creationDateTime: Date;
}