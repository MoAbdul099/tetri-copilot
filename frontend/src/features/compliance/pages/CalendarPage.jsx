import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OccurrenceStatusBadge from "../components/OccurrenceStatusBadge.jsx";
import { getCalendarEvents, listJurisdictions, listCategories } from "../services/complianceService.js";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";

function statusColor(status) {
  const MAP = {
    scheduled:   "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-orange-100 text-orange-800 border-orange-200",
    submitted:   "bg-purple-100 text-purple-800 border-purple-200",
    approved:    "bg-teal-100 text-teal-800 border-teal-200",
    completed:   "bg-green-100 text-green-800 border-green-200",
    overdue:     "bg-red-100 text-red-800 border-red-200",
    cancelled:   "bg-gray-100 text-gray-500 border-gray-200",
    archived:    "bg-gray-50 text-gray-400 border-gray-200",
  };
  return MAP[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [jurisdictions, setJurisdictions] = useState([]);
  const [filterJurisdiction, setFilterJurisdiction] = useState("");

  useEffect(() => {
    listJurisdictions().then((d) => setJurisdictions(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    setLoading(true);
    getCalendarEvents({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      status: filterStatus || undefined,
      jurisdictionId: filterJurisdiction || undefined,
    })
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month, filterStatus, filterJurisdiction]);

  const prevMonth = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = fmtDate(today);

  const eventsByDay = {};
  events.forEach((e) => {
    const key = fmtDate(new Date(e.dueDate));
    if (!eventsByDay[key]) eventsByDay[key] = [];
    eventsByDay[key].push(e);
  });

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}` : null;
  const selectedEvents = selectedDateStr ? (eventsByDay[selectedDateStr] || []) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-tetri-text">Compliance Calendar</h1>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-1.5 bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["scheduled","in_progress","submitted","approved","completed","overdue"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-1.5 bg-white" value={filterJurisdiction} onChange={(e) => setFilterJurisdiction(e.target.value)}>
            <option value="">All Jurisdictions</option>
            {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-tetri-border">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <h2 className="text-base font-semibold text-tetri-text">{MONTHS[month]} {year}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-tetri-border">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-tetri-neutral">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-tetri-neutral" /></div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-tetri-border min-h-[90px] bg-tetri-bg/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDay[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`border-r border-b border-tetri-border min-h-[90px] p-1.5 cursor-pointer transition-colors ${isSelected ? "bg-[#eff4ff]" : "hover:bg-tetri-bg/50"}`}
                >
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-tetri-blue text-white" : "text-tetri-neutral"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); navigate(`/compliance/occurrences/${ev.id}`); }}
                        className={`text-xs px-1.5 py-0.5 rounded border truncate ${statusColor(ev.status)}`}
                        title={ev.name}
                      >
                        {ev.name}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-tetri-neutral px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day events */}
      {selectedDay && selectedEvents.length > 0 && (
        <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-tetri-border bg-tetri-bg">
            <h3 className="text-sm font-semibold text-tetri-text">
              {MONTHS[month]} {selectedDay}, {year} — {selectedEvents.length} occurrence{selectedEvents.length !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="divide-y divide-tetri-border">
            {selectedEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/compliance/occurrences/${ev.id}`)}
                className="px-5 py-3 flex items-center justify-between hover:bg-tetri-bg/50 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-tetri-text">{ev.name}</p>
                  <p className="text-xs text-tetri-neutral">{ev.authority?.name || ev.jurisdiction?.name || ""}</p>
                </div>
                <OccurrenceStatusBadge status={ev.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDay && selectedEvents.length === 0 && (
        <div className="text-center py-6 text-sm text-tetri-muted">No occurrences on {MONTHS[month]} {selectedDay}</div>
      )}
    </div>
  );
}
