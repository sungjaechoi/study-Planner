export const GRID_MINUTES = 15;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

export const DEFAULT_DAY_START = 360;  // 6:00 AM
export const DEFAULT_DAY_END = 1380;   // 11:00 PM

export const PIXELS_PER_MINUTE = 1; // 1px per minute
export const HOUR_HEIGHT = PIXELS_PER_MINUTE * MINUTES_PER_HOUR; // 60px per hour

export const BLOCK_COLORS = {
  PLAN: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
  },
  EXECUTION: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
  },
};

export const TIME_INCREMENTS = [0, 15, 30, 45];
