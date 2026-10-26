// VAPID keys for Web Push Notifications
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BNN2eKyacNK4w-QNMZqkZ_DRwVyOwiVF_lAY_vjztUKgyoyUQcXpe7XZ1gUho_Ob0oIGMgSdL0xLIDyvAP34ugU';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'xCEptymaWHJIWVqFIFJnYjctufc-QWSJW5pWnlda9jQ';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:admin@saku.app';
