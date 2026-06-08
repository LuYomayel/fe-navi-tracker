"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Diálogo de confirmación tokenizado (reemplaza window.confirm). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              destructive
                ? cn(buttonVariants({ variant: "destructive" }))
                : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Hook de conveniencia: maneja open + payload para confirmar acciones. */
export function useConfirm<T = void>() {
  const [state, setState] = React.useState<{ open: boolean; payload?: T }>({
    open: false,
  });
  const resolver = React.useRef<((ok: boolean) => void) | null>(null);

  const confirm = React.useCallback((payload?: T) => {
    setState({ open: true, payload });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const onOpenChange = React.useCallback((open: boolean) => {
    setState((s) => ({ ...s, open }));
    if (!open) resolver.current?.(false);
  }, []);

  const onConfirm = React.useCallback(() => {
    resolver.current?.(true);
    setState((s) => ({ ...s, open: false }));
  }, []);

  return { ...state, confirm, onOpenChange, onConfirm };
}
