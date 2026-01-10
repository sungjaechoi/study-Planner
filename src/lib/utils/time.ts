/**
 * Time utility functions for Study Planner
 */

/**
 * Convert minutes (0-1440) to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Convert time string (HH:MM) to minutes (0-1440)
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Snap time to 15-minute increments
 */
export function snapTo15Minutes(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

/**
 * Check if time is in 15-minute increments
 */
export function isValid15MinIncrement(minutes: number): boolean {
  return minutes % 15 === 0;
}

/**
 * Convert minutes to hours string (e.g., 90 -> "1.5h")
 */
export function minutesToHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

/**
 * Validate time range
 */
export function isValidTimeRange(startMin: number, endMin: number): boolean {
  return startMin < endMin && startMin >= 0 && endMin <= 1440;
}
