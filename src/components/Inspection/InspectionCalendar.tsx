import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface InspectionCalendarProps {
  inspections: any[];
}

export function InspectionCalendar({ inspections }: InspectionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getInspectionsForDay = (day: Date) => {
    return inspections.filter(i => {
      const dateVal = i.date || i.scheduledDate;
      if (!dateVal) return false;
      const d = new Date(dateVal);
      return isValid(d) && isSameDay(d, day);
    });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4-sem border-b">
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/50">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px]">
          {/* Empty cells for padding before the first day of the month */}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b bg-muted/20" />
          ))}

          {days.map(day => {
            const dayInspections = getInspectionsForDay(day);
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                   "border-r border-b p-1-sem flex flex-col gap-1 overflow-hidden transition-colors hover:bg-muted/10",
                   isToday(day) && "bg-brand/5"
                )}
              >
                <div className="flex justify-between items-center p-1">
                  <span className={cn(
                    "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-brand text-brand-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  {dayInspections.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {dayInspections.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto pr-0.5 custom-scrollbar">
                  {dayInspections.slice(0, 3).map(inspection => (
                    <div 
                      key={inspection.id}
                      className="text-[10px] p-1 rounded border bg-card truncate leading-tight shadow-sm"
                    >
                      <div className="font-bold flex items-center gap-0.5">
                        <Clock className="h-2 w-2" />
                        {inspection.time || (isValid(new Date(inspection.scheduledDate)) ? format(new Date(inspection.scheduledDate), "HH:mm") : "—")}
                      </div>
                      <div className="truncate">{inspection.property}</div>
                    </div>
                  ))}
                  {dayInspections.length > 3 && (
                    <div className="text-[10px] text-center text-muted-foreground font-medium">
                      + {dayInspections.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
