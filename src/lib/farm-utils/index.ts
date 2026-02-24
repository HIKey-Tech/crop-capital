import type { Farm } from '@/types'

/**
 * Calculate the funding progress percentage for a farm
 */
export function calculateFundingProgress(farm: Farm): number {
  if (!farm.investmentGoal || farm.investmentGoal === 0) return 0
  return Math.min(
    Math.round((farm.fundedAmount / farm.investmentGoal) * 100),
    100,
  )
}

/**
 * Check if a farm is fully funded
 */
export function isFarmFullyFunded(farm: Farm): boolean {
  return farm.fundedAmount >= farm.investmentGoal
}

/**
 * Get the remaining investment amount needed
 */
export function getRemainingInvestment(farm: Farm): number {
  return Math.max(farm.investmentGoal - farm.fundedAmount, 0)
}

/**
 * Calculate projected ROI for an investment amount
 */
export function calculateProjectedROI(
  amount: number,
  roiPercent: number,
): number {
  return amount + (amount * roiPercent) / 100
}

/**
 * Get the array of all images for a farm
 */
export function getFarmImages(farm: Farm): Array<string> {
  return farm.images
}
