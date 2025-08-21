"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/models/Project"

interface GanttChartProps {
  project: Project
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "in-progress":
      return "bg-blue-500"
    case "delayed":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

export function GanttChart({ project }: GanttChartProps) {
  const { timeline, dateRange, dayWidth } = useMemo(() => {
    if (!project.timeline.length) {
      return { timeline: [], dateRange: [], dayWidth: 0 }
    }

    // Find the overall date range
    const allDates = project.timeline.flatMap((phase) => [new Date(phase.startDate), new Date(phase.endDate)])
    const minDate = startOfMonth(new Date(Math.min(...allDates.map((d) => d.getTime()))))
    const maxDate = endOfMonth(new Date(Math.max(...allDates.map((d) => d.getTime()))))

    const dateRange = eachDayOfInterval({ start: minDate, end: maxDate })
    const totalDays = dateRange.length
    const dayWidth = Math.max(20, Math.min(40, 800 / totalDays)) // Responsive day width

    return { timeline: project.timeline, dateRange, dayWidth }
  }, [project.timeline])

  if (!timeline.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No timeline data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline (Gantt View)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header with dates */}
            <div className="flex mb-4">
              <div className="w-48 flex-shrink-0" /> {/* Space for phase names */}
              <div className="flex">
                {dateRange.map((date, index) => {
                  const isFirstOfMonth = date.getDate() === 1
                  return (
                    <div
                      key={index}
                      className={cn("text-xs text-center border-l border-gray-200", isFirstOfMonth && "border-l-2")}
                      style={{ width: dayWidth }}
                    >
                      {isFirstOfMonth && <div className="font-medium">{format(date, "MMM")}</div>}
                      <div className="text-gray-500">{format(date, "d")}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Timeline bars */}
            <div className="space-y-3">
              {timeline.map((phase, phaseIndex) => {
                const startDate = new Date(phase.startDate)
                const endDate = new Date(phase.endDate)
                const duration = differenceInDays(endDate, startDate) + 1

                // Find position in the date range
                const startIndex = dateRange.findIndex((date) => isSameDay(date, startDate))
                const barWidth = duration * dayWidth

                return (
                  <div key={phase._id || phaseIndex} className="flex items-center">
                    {/* Phase name */}
                    <div className="w-48 flex-shrink-0 pr-4">
                      <div className="text-sm font-medium truncate">{phase.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {phase.status.replace("-", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{duration} days</span>
                      </div>
                    </div>

                    {/* Timeline bar */}
                    <div className="flex-1 relative h-8">
                      <div
                        className={cn("absolute top-1 h-6 rounded", getStatusColor(phase.status))}
                        style={{
                          left: startIndex * dayWidth,
                          width: barWidth,
                        }}
                      >
                        <div className="px-2 py-1 text-xs text-white truncate">{phase.name}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm">Delayed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded" />
                <span className="text-sm">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
