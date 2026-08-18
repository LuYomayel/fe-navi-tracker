"use client";

import { useRef, useState } from "react";
import { Star, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { uploadUrl } from "@/lib/api-client";
import { fileToResizedDataUrl } from "@/lib/image-resize";
import { toast } from "@/lib/toast-helper";
import type { PrintProductPhoto } from "@/types/printing";

interface PhotoManagerProps {
  productId: string;
  photos: PrintProductPhoto[];
  onAdd: (productId: string, dataUrl: string) => Promise<boolean>;
  onDelete: (photoId: string) => Promise<boolean>;
  onSetCover: (
    productId: string,
    photoId: string,
    allIds: string[],
  ) => Promise<boolean>;
}

/**
 * Fotos de un producto: grilla + subir (con resize en el cliente) + borrar
 * + elegir portada. La primera (order 0) es la que ve Marcelito primero.
 */
export default function PhotoManager({
  productId,
  photos,
  onAdd,
  onDelete,
  onSetCover,
}: PhotoManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        const dataUrl = await fileToResizedDataUrl(file);
        await onAdd(productId, dataUrl);
      }
    } catch (error) {
      console.error("Error procesando la foto:", error);
      toast.error("No se pudo procesar la foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const allIds = photos.map((p) => p.id);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadUrl(photo.url)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
                portada
              </span>
            )}
            <div className="absolute bottom-1 right-1 flex gap-1">
              {i !== 0 && (
                <button
                  type="button"
                  aria-label="Hacer portada"
                  className="rounded bg-black/60 p-1 text-white"
                  onClick={() => onSetCover(productId, photo.id, allIds)}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                aria-label="Borrar foto"
                className="rounded bg-black/60 p-1 text-white"
                onClick={() => onDelete(photo.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-[10px]">{uploading ? "Subiendo..." : "Agregar"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
