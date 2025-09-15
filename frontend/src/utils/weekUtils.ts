/**
 * Utility functions for determining the current NFL week
 */

/**
 * Get the current NFL week based on the current date
 * This is a simplified calculation - in a real app, you'd want to use
 * the actual NFL schedule dates
 */
export const getCurrentWeek = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // NFL season typically starts in early September
  // For this demo, we'll use a simple calculation
  // In a real app, you'd want to use actual NFL schedule dates
  
  // Assume season starts September 1st
  const seasonStart = new Date(currentYear, 8, 1); // Month is 0-indexed, so 8 = September
  
  // If we're before September, we're in the previous season
  if (now < seasonStart) {
    return getCurrentWeekForPreviousSeason();
  }
  
  // Calculate weeks since season start
  const weeksSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  // NFL regular season is 18 weeks
  const currentWeek = Math.min(Math.max(weeksSinceStart + 1, 1), 18);
  
  return currentWeek;
};

/**
 * Get current week for previous season (if we're in offseason)
 */
const getCurrentWeekForPreviousSeason = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If we're in offseason, default to week 1 of current year
  // In a real app, you might want to show the last week of the previous season
  return 1;
};

/**
 * Get the current season year
 */
export const getCurrentSeasonYear = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // If we're before September, we're still in the previous season
  if (now.getMonth() < 8) { // Month is 0-indexed, so 8 = September
    return currentYear - 1;
  }
  
  return currentYear;
};

/**
 * Check if a given week is the current week
 */
export const isCurrentWeek = (week: number): boolean => {
  return week === getCurrentWeek();
};

/**
 * Get a human-readable week label
 */
export const getWeekLabel = (week: number): string => {
  const currentWeek = getCurrentWeek();
  
  if (week === currentWeek) {
    return `Week ${week} (Current)`;
  }
  
  return `Week ${week}`;
};
