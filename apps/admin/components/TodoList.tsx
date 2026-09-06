"use client";

import { useState } from "react";
import {  Card  } from "@repo/ui";
import {  Checkbox  } from "@repo/ui";
import {  Popover, PopoverContent, PopoverTrigger  } from "@repo/ui";
import {  ScrollArea  } from "@repo/ui";
import { CalendarIcon, AlertCircle, ShoppingBag, Box, UserCheck } from "lucide-react";
import { format } from "date-fns";
import {  Calendar  } from "@repo/ui";
import { ActionItemType } from "@/types/admin";
import {  Badge  } from "@repo/ui";

const DEFAULT_TASKS: ActionItemType[] = [
  {
    id: "task-1",
    title: "Verify incoming mobile money / card payouts",
    type: "order",
    date: "Today",
    isUrgent: true,
  },
  {
    id: "task-2",
    title: "Review pending seller catalog updates in Sanity",
    type: "inventory",
    date: "Today",
    isUrgent: true,
  },
  {
    id: "task-3",
    title: "Confirm delivery status for dispatched customer orders",
    type: "order",
    date: "Today",
  },
  {
    id: "task-4",
    title: "Audit low stock gadget inventory thresholds",
    type: "inventory",
    date: "This Week",
  },
  {
    id: "task-5",
    title: "Review new student seller profile registrations",
    type: "user",
    date: "This Week",
  },
];

const TodoList = ({
  actionItems = DEFAULT_TASKS,
}: {
  actionItems?: ActionItemType[];
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    "task-1": false,
    "task-2": false,
  });

  const toggleTask = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (type: ActionItemType["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-4 w-4 text-primary" />;
      case "inventory":
        return <Box className="h-4 w-4 text-amber-500" />;
      case "user":
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium">Store Operations</h1>
        <Badge variant="outline" className="text-xs font-normal">
          {actionItems.length} tasks
        </Badge>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full flex items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground py-2 text-sm font-medium shadow-xs hover:bg-secondary/80 transition-colors">
          <CalendarIcon className="h-4 w-4" />
          {date ? format(date, "PPP") : <span>Filter by date</span>}
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate: Date | undefined) => {
              setDate(selectedDate);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <ScrollArea className="max-h-[380px] mt-4 overflow-y-auto">
        <div className="flex flex-col gap-2.5">
          {actionItems.map((task) => {
            const isDone = !!completed[task.id];
            return (
              <Card
                key={task.id}
                className={`p-3 transition-colors cursor-pointer border ${
                  isDone ? "opacity-60 bg-muted/40" : "hover:bg-accent/40"
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={task.id}
                    checked={isDone}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {getIcon(task.type)}
                      <label
                        htmlFor={task.id}
                        className={`text-xs font-medium cursor-pointer leading-tight ${
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {task.date}
                      </span>
                      {task.isUrgent && !isDone && (
                        <span className="text-[10px] text-destructive font-semibold">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;

