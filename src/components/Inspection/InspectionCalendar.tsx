import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeFormat, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            {safeFormat(currentMonth, "MMMM yyyy")}
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
            const isSelected = isToday(day);
            
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                   "border-r border-b p-1.5 flex flex-col gap-1 overflow-hidden transition-all hover:bg-muted/30 group/day",
                   isSelected && "bg-primary/5"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                    isSelected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground group-hover/day:text-foreground"
                  )}>
                    {safeFormat(day, "d")}
                  </span>
                  {dayInspections.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold bg-primary/10 text-primary border-none">
                      {dayInspections.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto pr-0.5 custom-scrollbar flex-1">
                  {dayInspections.slice(0, 3).map(inspection => (
                    <div 
                      key={inspection.id}
                      className={cn(
                        "text-[9px] p-1.5 rounded-lg border shadow-sm truncate leading-tight transition-transform active:scale-95 cursor-pointer",
                        inspection.status === 'complete' ? "bg-green-50 border-green-100 text-green-700" : 
                        inspection.status === 'progress' ? "bg-blue-50 border-blue-100 text-blue-700" :
                        "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <div className="font-bold flex items-center gap-1 mb-0.5">
                        <Clock className="h-2 w-2 shrink-0" />
                        {inspection.time || safeFormat(inspection.scheduledDate, "HH:mm")}
                      </div>
                      <div className="truncate font-medium">{inspection.property} - {inspection.unit}</div>
                    </div>
                  ))}
                  {dayInspections.length > 3 && (
                    <div className="text-[9px] text-center text-muted-foreground font-bold py-1 bg-muted/20 rounded-md mt-auto">
                      + {dayInspections.length - 3} vistorias
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
