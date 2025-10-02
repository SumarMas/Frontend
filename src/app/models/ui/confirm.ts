export type ConfirmVariant = 'error' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    dismissible?: boolean;      //bonton cancelar
    backdropDismiss?: boolean;  // cerrar al hacer click fuera
    escDismiss?: boolean;       //cerrar con esc
}