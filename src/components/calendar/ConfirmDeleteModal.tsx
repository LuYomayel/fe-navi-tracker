"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import type { Activity } from "@/types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activity: Activity | null;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  activity,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  if (!activity) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar eliminación
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que quieres eliminar el hábito{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{activity.name}&rdquo;
              </span>
              ?
            </p>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Esta acción:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Eliminará permanentemente el hábito</li>
                <li>Borrará todo el historial de completaciones</li>
                <li>No se puede deshacer</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Si solo quieres pausar temporalmente este hábito, considera usar
              la opción &ldquo;Archivar&rdquo; en su lugar.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
