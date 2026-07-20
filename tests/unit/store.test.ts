import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../../src/store';

describe('Settings Store', () => {
  beforeEach(() => {
    // Reset store state if needed, though persist might keep it
    const { setTheme, setFontSize } = useSettingsStore.getState();
    setTheme('system');
    setFontSize(26);
  });

  it('should initialize with default values', () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('system');
    expect(state.fontSize).toBe(26);
  });

  it('should update theme correctly', () => {
    const { setTheme } = useSettingsStore.getState();
    
    setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
    
    setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('should update font size within bounds', () => {
    const { setFontSize } = useSettingsStore.getState();
    
    setFontSize(30);
    expect(useSettingsStore.getState().fontSize).toBe(30);
  });
});
