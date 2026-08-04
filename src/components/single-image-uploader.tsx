"use client";

import Image from "next/image";

import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { HugeiconsIcon } from "@hugeicons/react";
import { XCircle } from "@hugeicons/core-free-icons";

type Props = {
  endpoint: "categoryImage" | "brandLogo";
  url: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function SingleImageUploader({ endpoint, url, onChange, label }: Props) {
  if (url) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <Image src={url} alt={label ?? ""} fill sizes="64px" className="object-cover" />
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600"
        >
          <HugeiconsIcon icon={XCircle} className="h-3 w-3" />
          Remove
        </button>
      </div>
    );
  }

  return (
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
  );
}