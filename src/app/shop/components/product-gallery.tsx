import { ImageOff } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-neutral-100">
        <HugeiconsIcon icon={ImageOff} className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
      </div>
    );
  }

  const [first, second, ...rest] = images;

  return (
    <div className="flex flex-col gap-1">
      {second ? (
        <div className="grid grid-cols-2 gap-1">
          <div className="relative aspect-[3/4]">
            <Image
              src={first.url}
              alt={first.alt ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="relative aspect-[3/4]">
            <Image
              src={second.url}
              alt={second.alt ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      ) : (
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={first.url}
            alt={first.alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {rest.map((img, i) => (
        <div key={i} className="relative aspect-[4/5] w-full">
          <Image
            src={img.url}
            alt={img.alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}