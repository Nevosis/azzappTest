export type CalendarEvent = {
  start: number;
  end: number;
};

export type CalendarEventFormatted = {
  start?: number;
  end?: number;
  y?: number;
  height?: number;
  pos?: number;
  posMax?: number;
};
