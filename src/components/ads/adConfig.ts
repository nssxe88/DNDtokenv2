/** AdSense configuration read from environment variables. */
const rawClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

export const AD_CONFIG = {
  clientId: typeof rawClientId === 'string' && rawClientId.startsWith('ca-pub-') ? rawClientId : undefined,
  enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
  slots: {
    sidebar: import.meta.env.VITE_AD_SLOT_SIDEBAR as string | undefined,
    gallery: import.meta.env.VITE_AD_SLOT_GALLERY as string | undefined,
    export: import.meta.env.VITE_AD_SLOT_EXPORT as string | undefined,
    preview: import.meta.env.VITE_AD_SLOT_PREVIEW as string | undefined,
    welcome: import.meta.env.VITE_AD_SLOT_WELCOME as string | undefined,
  },
} as const;

export type AdSlotName = keyof typeof AD_CONFIG.slots;

export interface AdSlotConfig {
  slotId: string;
  format: 'display' | 'in-feed' | 'in-article' | 'auto';
  width?: number;
  height?: number;
}
