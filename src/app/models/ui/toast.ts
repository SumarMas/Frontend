export type ToastType = 'info' | 'success' | 'warning' | 'error';

export type Pos = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export const POS_CLASSES = {
    "top-left": 'toast-top toast-start',
    "top-center": 'toast-top toast-center',
    "top-right": 'toast-top toast-end',
    "middle-left" : 'toast-start toast-middle',
    "middle-center": 'toast-middle toast-center',
    "middle-right": 'toast-middle toast-end',
    "bottom-left": 'toast-start',
    "bottom-center": 'toast-center',
    "bottom-right": 'toast-end'
} as const satisfies Record<Pos, string>;

export const ALERT_CLASS_BY_TYPE = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
} as const satisfies Record<ToastType, string>;

export const ICON_BY_TYPE = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    error: 'error',
} as const satisfies Record<ToastType, string>;

export const DEFAULT_DURATION_MS = 3000;