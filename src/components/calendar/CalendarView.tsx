"use client";

import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { EventItem } from "@/types";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

interface CalendarViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onSelectDate
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState<string>("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState<string>("");

  // Chuyển đổi dữ liệu sự kiện sang format FullCalendar
  const fullCalendarEvents = events.map((e) => {
    const typeInfo = EVENT_TYPE_MAP[e.type];
    return {
      id: e.id,
      title: e.title,
      start: e.startDateTime,
      end: e.endDateTime || e.startDateTime,
      allDay: e.allDay,
      backgroundColor: e.color || typeInfo.color,
      borderColor: e.color || typeInfo.color,
      textColor: "#ffffff",
      extendedProps: e
    };
  });

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setCalendarTitle(api.view.title);
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setCalendarTitle(api.view.title);
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setCalendarTitle(api.view.title);
    }
  };

  const handleChangeView = (viewName: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(viewName);
      setCurrentView(viewName);
      setCalendarTitle(api.view.title);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-4 sm:p-6 shadow-xs space-y-4">
      {/* Calendar Custom Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition cursor-pointer"
          >
            Hôm nay
          </button>
          <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white capitalize ml-2">
            {calendarTitle || "Lịch Sự Kiện"}
          </span>
        </div>

        {/* View Switchers: Tháng / Tuần / Ngày / Danh sách */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl self-start sm:self-auto border border-transparent dark:border-zinc-800">
          {[
            { id: "dayGridMonth", label: "Tháng" },
            { id: "timeGridWeek", label: "Tuần" },
            { id: "timeGridDay", label: "Ngày" },
            { id: "listMonth", label: "Danh sách" }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => handleChangeView(v.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                currentView === v.id
                  ? "bg-white dark:bg-[#0c0c0e] text-blue-600 dark:text-blue-400 shadow-2xs border border-transparent dark:border-zinc-700"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category legend colors */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 py-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Màu lịch:</span>
        {Object.entries(EVENT_TYPE_MAP).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: info.color }}
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              {info.label}
            </span>
          </div>
        ))}
      </div>

      {/* FullCalendar Component */}
      <div className="calendar-container overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          locale="vi"
          events={fullCalendarEvents}
          editable={false}
          selectable={true}
          dayMaxEvents={3}
          height="auto"
          datesSet={(arg) => setCalendarTitle(arg.view.title)}
          dateClick={(info) => onSelectDate(info.dateStr)}
          eventClick={(info) => {
            const ev = events.find((e) => e.id === info.event.id);
            if (ev) onSelectEvent(ev);
          }}
        />
      </div>
    </div>
  );
};
