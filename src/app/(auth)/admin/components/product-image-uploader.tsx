"use client";

import Image from "next/image";

import { UploadButton } from "@/lib/uploadthing";
import { DraftImage } from "./product-form-types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel02Icon } from "@hugeicons/core-free-icons";

type Props = {
  images: DraftImage[];
  onChange: (images: DraftImage[]) => void;
};

export function ProductImageUploader({ images, onChange }: Props) {
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, i) => (
            <div
              key={img.key}
              className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-50"
            >
              <Image
                src={img.url}
                alt={img.alt ?? ""}
                fill
                sizes="150px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <HugeiconsIcon icon={Cancel02Icon} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <UploadButton
        endpoint="productImage"
        onClientUploadComplete={(res) => {
          console.log("upload res:", res);
          const uploaded = res.map((f) => ({ url: f.ufsUrl, key: f.key }));
          onChange([...images, ...uploaded]);
        }}
        onUploadError={(error) => {
          console.error(error);
          alert(`Upload failed: ${error.message}`);
        }}
      />
      <p className="text-xs text-neutral-500">
        First image uploaded is used as the cover image. Drag to reorder isn&apos;t wired up yet — remove and re-upload to change the order for now.
      </p>
    </div>
  );
}