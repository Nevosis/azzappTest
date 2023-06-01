import { useEffect, useState } from "react";
import "./Calendar.css";
import { CalendarEvent, CalendarEventFormatted } from "./Calendar.types";
import EventEmitter from "eventemitter3";

var EE = new EventEmitter();

function areEventsColateral(e1: CalendarEvent, e2: CalendarEvent) {
  if (
    (e1.start <= e2.start && e1.end >= e2.start) ||
    (e1.start <= e2.end && e1.end >= e2.end) ||
    (e1.start >= e2.start && e1.end <= e2.end)
  )
    return true;
  return false;
}

function countColateralEvents(
  calendarEvents: CalendarEvent[],
  calendarEvent: CalendarEvent,
  exceptionsIndex: number[],
  lastPosition: number,
  eventsFormatted: CalendarEventFormatted[],
  currentIndex: number
) {
  calendarEvents.forEach((calEvent, index) => {
    if (index < currentIndex) return;
    if (exceptionsIndex.indexOf(index) >= 0) return;
    if (areEventsColateral(calEvent, calendarEvent)) {
      eventsFormatted.forEach((formatted, indexFormatted) => {
        if (exceptionsIndex.indexOf(indexFormatted) >= 0) {
          formatted.posMax = exceptionsIndex.length;
          formatted.pos = exceptionsIndex.indexOf(indexFormatted) + 1;
        }
      });
      countColateralEvents(
        calendarEvents,
        calendarEvent,
        [...exceptionsIndex, index],
        lastPosition,
        eventsFormatted,
        currentIndex
      );
    }
  });
}

function layOutDay(calendarEvents: CalendarEvent[]): void {
  let eventsFormatted: CalendarEventFormatted[] = [];
  calendarEvents.sort((a, b) => a.start - b.start);
  eventsFormatted = [...calendarEvents];

  calendarEvents.forEach((calendarEvent, calendarEventIndex) => {
    eventsFormatted[calendarEventIndex].y = calendarEvent.start;
    eventsFormatted[calendarEventIndex].height =
      calendarEvent.end - calendarEvent.start;
    eventsFormatted[calendarEventIndex].pos = 0;

    countColateralEvents(
      calendarEvents,
      calendarEvent,
      [calendarEventIndex],
      0,
      eventsFormatted,
      calendarEventIndex
    );
  });
  EE.emit("updateEvents", eventsFormatted);
}

(window as any).layOutDay = layOutDay;

const Calendar = () => {
  const [calendarEvents, setCalendarEvents] = useState<
    CalendarEventFormatted[]
  >([]);

  useEffect(() => {
    EE.on("updateEvents", (events) => {
      setCalendarEvents(events);
    });
  }, []);
  console.log(calendarEvents.length);
  return (
    <div className="Calendar-container">
      {calendarEvents.map((calendarEvent, i) => (
        <Event {...calendarEvent} key={i} />
      ))}
    </div>
  );
};

const Event = ({
  y,
  height,
  pos,
  posMax,
}: {
  y?: number;
  height?: number;
  pos?: number;
  posMax?: number;
}) => {
  return (
    <div
      className="Calendar-event"
      style={{
        top: y,
        left: 10 + (pos ?? 0) * (600 / (posMax ?? 1)),
        height,
        width: 600 / (posMax ?? 1),
      }}
    >
      <div className="Calendar-event-title">
        <b>Sample Item</b>
      </div>
      <div className="Calendar-event-description">Sample description</div>
    </div>
  );
};

export default Calendar;
