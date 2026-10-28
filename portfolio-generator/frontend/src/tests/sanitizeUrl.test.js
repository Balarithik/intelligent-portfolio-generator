import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../components/Preview/PortfolioLivePreview';

describe('sanitizeUrl security verification', () => {
  it('blocks dangerous javascript: schemes to prevent DOM XSS', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('JAVASCRIPT:alert(document.cookie)')).toBe('#');
    expect(sanitizeUrl('  javascript:void(0)  ')).toBe('#');
  });

  it('blocks dangerous data: and vbscript: schemes', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('#');
  });

  it('allows safe http:// and https:// URLs', () => {
    expect(sanitizeUrl('https://github.com/alex')).toBe('https://github.com/alex');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows mailto: and tel: schemes', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+15551234567')).toBe('tel:+15551234567');
  });

  it('safely normalizes URLs missing protocol to https://', () => {
    expect(sanitizeUrl('linkedin.com/in/alex')).toBe('https://linkedin.com/in/alex');
    expect(sanitizeUrl('alexrivera.dev')).toBe('https://alexrivera.dev');
  });

  it('handles null, undefined, or empty inputs safely', () => {
    expect(sanitizeUrl(null)).toBe('#');
    expect(sanitizeUrl(undefined)).toBe('#');
    expect(sanitizeUrl('')).toBe('#');
  });
});

