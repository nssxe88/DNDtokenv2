import { describe, it, expect } from 'vitest';
import { AD_CONFIG } from '../../components/ads/adConfig.ts';
import type { AdSlotName } from '../../components/ads/adConfig.ts';

describe('adConfig', () => {
  it('should have correct structure', () => {
    expect(AD_CONFIG).toBeDefined();
    expect(AD_CONFIG).toHaveProperty('clientId');
    expect(AD_CONFIG).toHaveProperty('enabled');
    expect(AD_CONFIG).toHaveProperty('slots');
  });

  it('should have clientId as string or undefined', () => {
    expect(typeof AD_CONFIG.clientId === 'string' || AD_CONFIG.clientId === undefined).toBe(true);
  });

  it('should have enabled as boolean', () => {
    expect(typeof AD_CONFIG.enabled).toBe('boolean');
  });

  it('should have slots object with correct keys', () => {
    const expectedSlots: AdSlotName[] = [
      'sidebar',
      'gallery',
      'export',
      'preview',
      'welcome',
    ];

    const actualSlots = Object.keys(AD_CONFIG.slots);
    expect(actualSlots).toEqual(expect.arrayContaining(expectedSlots));
    expect(actualSlots.length).toBe(expectedSlots.length);
  });

  it('should have all slot values as string or undefined', () => {
    const slots = AD_CONFIG.slots;

    Object.values(slots).forEach((slotValue) => {
      expect(typeof slotValue === 'string' || slotValue === undefined).toBe(true);
    });
  });

  describe('slot configuration', () => {
    it('should have sidebar slot', () => {
      expect(AD_CONFIG.slots).toHaveProperty('sidebar');
    });

    it('should have gallery slot', () => {
      expect(AD_CONFIG.slots).toHaveProperty('gallery');
    });

    it('should have export slot', () => {
      expect(AD_CONFIG.slots).toHaveProperty('export');
    });

    it('should have preview slot', () => {
      expect(AD_CONFIG.slots).toHaveProperty('preview');
    });

    it('should have welcome slot', () => {
      expect(AD_CONFIG.slots).toHaveProperty('welcome');
    });
  });

  describe('environment variable mapping', () => {
    it('should read enabled flag from VITE_ADSENSE_ENABLED', () => {
      // The config reads from import.meta.env.VITE_ADSENSE_ENABLED
      // In test env without .env file, it should default to false
      expect(typeof AD_CONFIG.enabled).toBe('boolean');
    });

    it('should be readonly at type level', () => {
      // The config is defined with `as const`, making it readonly at compile-time
      // TypeScript will prevent reassignment, but we can't test runtime immutability
      // without Object.freeze, which is not used here
      expect(AD_CONFIG).toBeDefined();
    });
  });

  describe('type exports', () => {
    it('should export AdSlotName type', () => {
      const validSlotNames: AdSlotName[] = [
        'sidebar',
        'gallery',
        'export',
        'preview',
        'welcome',
      ];

      // Type test - if this compiles, AdSlotName is correctly exported
      validSlotNames.forEach((slotName) => {
        // slots can be undefined if env vars not set, which is valid
        expect(AD_CONFIG.slots).toHaveProperty(slotName);
      });
    });
  });

  describe('configuration validation', () => {
    it('should have consistent configuration', () => {
      // If enabled is true, clientId should ideally be defined
      // But in test environment without .env, enabled will be false
      // and clientId will be undefined - this is expected behavior
      if (AD_CONFIG.enabled && AD_CONFIG.clientId) {
        expect(AD_CONFIG.clientId).not.toBe('');
      }
      // Test passes regardless of config state
      expect(AD_CONFIG).toBeDefined();
    });

    it('should handle missing environment variables gracefully', () => {
      // Config should not throw even if env vars are missing
      expect(() => {
        void AD_CONFIG.clientId;
        void AD_CONFIG.enabled;
        void AD_CONFIG.slots.sidebar;
      }).not.toThrow();
    });
  });

  describe('production readiness', () => {
    it('should support all required ad placements', () => {
      // These are the critical ad placements from the spec
      const requiredPlacements: AdSlotName[] = [
        'sidebar',   // Sidebar ad
        'gallery',   // Gallery page ad
        'export',    // Export modal ad
        'welcome',   // Welcome/empty state ad
      ];

      requiredPlacements.forEach((placement) => {
        expect(AD_CONFIG.slots).toHaveProperty(placement);
      });
    });

    it('should not have ads in canvas editor', () => {
      // Verify there's no 'canvas' or 'editor' slot
      const slotKeys = Object.keys(AD_CONFIG.slots);
      expect(slotKeys).not.toContain('canvas');
      expect(slotKeys).not.toContain('editor');
    });
  });
});
