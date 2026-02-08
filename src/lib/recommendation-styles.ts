/**
 * Shared recommendation styles for DNB analysis components.
 * Uses semantic design tokens from the design system.
 */

export const recommendationBadgeStyles: Record<string, string> = {
  ideal: 'bg-success/10 text-success border-success/20',
  alert: 'bg-warning/10 text-warning border-warning/20',
  'not-ideal': 'bg-destructive/10 text-destructive border-destructive/20',
  wait: 'bg-info/10 text-info border-info/20',
};

export const recommendationDotStyles: Record<string, string> = {
  ideal: 'bg-success',
  alert: 'bg-warning',
  'not-ideal': 'bg-destructive',
  wait: 'bg-info',
};

export const recommendationGradientStyles: Record<string, string> = {
  ideal: 'from-success/20 to-success/5 border-success/30',
  alert: 'from-warning/20 to-warning/5 border-warning/30',
  'not-ideal': 'from-destructive/20 to-destructive/5 border-destructive/30',
  wait: 'from-info/20 to-info/5 border-info/30',
};

export function getVariationColorClass(variation: number): string {
  return variation >= 0 ? 'text-success' : 'text-destructive';
}
