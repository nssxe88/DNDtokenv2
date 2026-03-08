import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../store/index.ts';

describe('consentSlice', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset store
    useStore.setState({
      cookieConsent: null,
      consentBannerVisible: false,
    });
  });

  it('should start with null consent and hidden banner', () => {
    const state = useStore.getState();
    expect(state.cookieConsent).toBeNull();
    expect(state.consentBannerVisible).toBe(false);
  });

  describe('loadSavedConsent', () => {
    it('should show banner when no saved consent exists', () => {
      const state = useStore.getState();
      state.loadSavedConsent();

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toBeNull();
      expect(updatedState.consentBannerVisible).toBe(true);
    });

    it('should load saved consent from localStorage', () => {
      const savedConsent = {
        necessary: true,
        analytics: true,
        advertising: false,
      };

      localStorage.setItem('cookie-consent', JSON.stringify(savedConsent));

      const state = useStore.getState();
      state.loadSavedConsent();

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toEqual(savedConsent);
      expect(updatedState.consentBannerVisible).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('cookie-consent', 'invalid-json{{{');

      const state = useStore.getState();
      state.loadSavedConsent();

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toBeNull();
      expect(updatedState.consentBannerVisible).toBe(true);
    });
  });

  describe('acceptAllCookies', () => {
    it('should set all consent flags to true', () => {
      const state = useStore.getState();
      state.acceptAllCookies();

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toEqual({
        necessary: true,
        analytics: true,
        advertising: true,
      });
      expect(updatedState.consentBannerVisible).toBe(false);
    });

    it('should save consent to localStorage', () => {
      const state = useStore.getState();
      state.acceptAllCookies();

      const saved = localStorage.getItem('cookie-consent');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual({
        necessary: true,
        analytics: true,
        advertising: true,
      });
    });
  });

  describe('acceptNecessaryOnly', () => {
    it('should set only necessary cookies to true', () => {
      const state = useStore.getState();
      state.acceptNecessaryOnly();

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toEqual({
        necessary: true,
        analytics: false,
        advertising: false,
      });
      expect(updatedState.consentBannerVisible).toBe(false);
    });

    it('should save consent to localStorage', () => {
      const state = useStore.getState();
      state.acceptNecessaryOnly();

      const saved = localStorage.getItem('cookie-consent');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual({
        necessary: true,
        analytics: false,
        advertising: false,
      });
    });
  });

  describe('updateCookieConsent', () => {
    it('should update partial consent settings', () => {
      const state = useStore.getState();

      // Start with necessary only
      state.acceptNecessaryOnly();

      // Update to enable analytics
      state.updateCookieConsent({ analytics: true });

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toEqual({
        necessary: true,
        analytics: true,
        advertising: false,
      });
    });

    it('should always keep necessary cookies enabled', () => {
      const state = useStore.getState();
      state.acceptAllCookies();

      // Try to disable necessary cookies (should be forced to true)
      state.updateCookieConsent({ necessary: false });

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent?.necessary).toBe(true);
    });

    it('should create default consent if none exists', () => {
      const state = useStore.getState();

      // Update without any prior consent
      state.updateCookieConsent({ advertising: true });

      const updatedState = useStore.getState();
      expect(updatedState.cookieConsent).toEqual({
        necessary: true,
        analytics: false,
        advertising: true,
      });
    });

    it('should save updated consent to localStorage', () => {
      const state = useStore.getState();
      state.acceptNecessaryOnly();

      state.updateCookieConsent({ analytics: true, advertising: true });

      const saved = localStorage.getItem('cookie-consent');
      const parsed = JSON.parse(saved!);

      expect(parsed).toEqual({
        necessary: true,
        analytics: true,
        advertising: true,
      });
    });

    it('should hide banner after updating consent', () => {
      const state = useStore.getState();
      useStore.setState({ consentBannerVisible: true });

      state.updateCookieConsent({ analytics: true });

      const updatedState = useStore.getState();
      expect(updatedState.consentBannerVisible).toBe(false);
    });
  });

  describe('consent workflow', () => {
    it('should support full user consent workflow', () => {
      const state = useStore.getState();

      // 1. User loads page - no saved consent
      state.loadSavedConsent();
      expect(useStore.getState().consentBannerVisible).toBe(true);

      // 2. User accepts all
      state.acceptAllCookies();
      expect(useStore.getState().cookieConsent?.advertising).toBe(true);
      expect(useStore.getState().consentBannerVisible).toBe(false);

      // 3. User reloads page - consent is loaded
      useStore.setState({ cookieConsent: null, consentBannerVisible: false });
      state.loadSavedConsent();
      expect(useStore.getState().cookieConsent?.advertising).toBe(true);
      expect(useStore.getState().consentBannerVisible).toBe(false);
    });

    it('should support updating consent preferences', () => {
      const state = useStore.getState();

      // Accept all initially
      state.acceptAllCookies();
      expect(useStore.getState().cookieConsent?.advertising).toBe(true);

      // Later disable advertising
      state.updateCookieConsent({ advertising: false });
      expect(useStore.getState().cookieConsent?.advertising).toBe(false);
      expect(useStore.getState().cookieConsent?.necessary).toBe(true);
    });
  });
});
