"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Pause, Play, Plus, ArrowLeft } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { PillToggle } from "@/components/ui/pill-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { projectColor, shortDate } from "@/lib/project-ui";
import ProjectDialog from "./ProjectDialog";

export function ProgressBar({ value, color }: { value: number; color?: string | null }) {
  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full transition-all ${projectColor(color).bar}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/** "4/10 hechas · 2 vencidas · próxima 12/10" */
export function StatsLine({ p }: { p: Pick<Project, "stats"> }) {
  const s = p.stats;
  return (
    <p className="text-muted-foreground text-xs">
      {s.done}/{s.total} hechas
      {s.overdue > 0 && (
        <span className="text-destructive"> · {s.overdue} vencida{s.overdue === 1 ? "" : "s"}</span>
      )}
      {s.nextDue && <> · próxima {shortDate(s.nextDue)}</>}
    </p>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const setProjectStatus = useNaviTrackerStore((s) => s.setProjectStatus);
  const openMilestones = p.milestones.filter((m) => !m.done);
  const nextMilestone = openMilestones
    .filter((m) => m.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))[0];

  return (
    <div className="bg-card relative flex items-stretch overflow-hidden rounded-lg border">
      <div className={`w-1 shrink-0 ${projectColor(p.color).bar}`} />
      <Link href={`/proyectos?id=${p.id}`} className="min-w-0 flex-1 space-y-2 p-3">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {p.emoji ? `${p.emoji} ` : ""}
            {p.name}
          </span>
          <span className="text-muted-foreground ml-auto shrink-0 text-xs">
            {p.stats.progress}%
          </span>
        </div>
        <ProgressBar value={p.stats.progress} color={p.color} />
        <StatsLine p={p} />
        {openMilestones.length > 0 && (
          <p className="text-muted-foreground truncate text-xs">
            🏁 {openMilestones.length} hito{openMilestones.length === 1 ? "" : "s"}
            {nextMilestone && (
              <>
                {" "}· próximo: {nextMilestone.name} ({shortDate(nextMilestone.dueDate)})
              </>
            )}
          </p>
        )}
      </Link>
      {p.status !== "archived" && (
        <button
          type="button"
          onClick={() =>
            setProjectStatus(p.id, p.status === "paused" ? "active" : "paused")
          }
          aria-label={p.status === "paused" ? `Reanudar ${p.name}` : `Pausar ${p.name}`}
          className="text-muted-foreground hover:text-foreground flex w-12 shrink-0 items-center justify-center border-l"
        >
          {p.status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export default function ProjectsOverview() {
  const projects = useNaviTrackerStore((s) => s.projects);
  const projectsLoaded = useNaviTrackerStore((s) => s.projectsLoaded);
  const createProject = useNaviTrackerStore((s) => s.createProject);
  const [tab, setTab] = useState<ProjectStatus>("active");
  const [showCreate, setShowCreate] = useState(false);

  const count = (st: ProjectStatus) => projects.filter((p) => p.status === st).length;
  const list = projects.filter((p) => p.status === tab);

  return (
    <div className="space-y-4">
      <Link
        href="/tasks"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Tareas
      </Link>

      <PageHeader
        title="Proyectos"
        subtitle="Organizá tus tareas por proyecto e hitos"
        icon={FolderKanban}
        action={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo
          </Button>
        }
      />

      <PillToggle
        aria-label="Estado de los proyectos"
        value={tab}
        onChange={setTab}
        options={[
          { value: "active", label: `Activos (${count("active")})` },
          { value: "paused", label: `En pausa (${count("paused")})` },
          { value: "archived", label: `Archivados (${count("archived")})` },
        ]}
      />

      {tab === "paused" && list.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Las tareas de estos proyectos no aparecen en Tareas ni en el progreso del día.
        </p>
      )}

      {!projectsLoaded ? (
        <div className="text-muted-foreground py-8 text-center text-sm">Cargando…</div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={
            tab === "active"
              ? "No hay proyectos activos"
              : tab === "paused"
                ? "Nada en pausa"
                : "Nada archivado"
          }
          description={
            tab === "active"
              ? "Creá uno para agrupar sus tareas y seguir el avance."
              : undefined
          }
          action={
            tab === "active" ? (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1 h-4 w-4" /> Nuevo proyecto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <ProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={(data) => createProject(data)}
      />
    </div>
  );
}
