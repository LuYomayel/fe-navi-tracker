"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useXp } from "@/hooks/useXp";
// import { XP_ACTION_MESSAGES } from "@/types/xp";
import { Clock, Star, Utensils, BookOpen, Trophy, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface XpLogWidgetProps {
  className?: string;
  maxItems?: number;
}

export function XpLogWidget({
  className = "",
  maxItems = 10,
}: XpLogWidgetProps) {
  const { xpStats, isLoading } = useXp();

  if (isLoading || !xpStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted/50 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "habit_complete":
        return <Star className="w-4 h-4 text-blue-500" />;
      case "nutrition_log":
        return <Utensils className="w-4 h-4 text-green-500" />;
      case "daily_comment":
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case "level_up":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "streak_bonus":
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "habit_complete":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "nutrition_log":
        return "bg-green-100 text-green-700 border-green-200";
      case "daily_comment":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "level_up":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "streak_bonus":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const recentLogs = xpStats.recentLogs.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aún no hay actividad</p>
            <p className="text-sm">¡Completa tu primer hábito para empezar!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/50"
                >
                  <div className="mt-0.5">{getActionIcon(log.action)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {log.description}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getActionColor(log.action)}`}
                      >
                        +{log.xpEarned} XP
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>

                      {log.metadata && log.metadata.streakBonus > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Bonus: +{log.metadata.streakBonus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
