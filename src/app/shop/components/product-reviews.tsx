"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { createReview } from "@/app/reviews/actions";

type ReviewView = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  userName: string;
};

function Stars({
  rating,
  size = 14,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `Rate ${n} stars` : undefined}
        >
          <HugeiconsIcon icon={StarIcon}
            width={size}
            height={size}
            fill={n <= rating ? "#171717" : "none"}
            stroke="#171717"
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  isLoggedIn,
}: {
  productId: string;
  productSlug: string;
  reviews: ReviewView[];
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }

    setSubmitting(true);
    const result = await createReview({
      productId,
      productSlug,
      rating,
      title,
      body,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <div className="mb-8 flex items-center gap-3">
        <h2 className="text-xl font-normal uppercase tracking-wide text-neutral-900">
          Reviews
        </h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-neutral-500">
            <Stars rating={Math.round(average)} />
            {average.toFixed(1)} ({reviews.length})
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mb-10 text-sm text-neutral-500">
          No reviews yet — be the first to share your thoughts.
        </p>
      ) : (
        <ul className="mb-10 flex flex-col gap-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-neutral-100 pb-6">
              <div className="mb-1 flex items-center gap-3">
                <Stars rating={r.rating} />
                <span className="text-sm font-medium text-neutral-800">
                  {r.userName}
                </span>
              </div>
              {r.title && (
                <p className="mt-1 text-sm font-medium text-neutral-900">{r.title}</p>
              )}
              {r.body && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {r.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-neutral-200 pt-8">
        {!isLoggedIn ? (
          <p className="text-sm text-neutral-500">
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        ) : submitted ? (
          <p className="text-sm text-neutral-600">
            Thanks — your review is in and will show up once it&apos;s approved.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-neutral-800">Write a review</p>
            <Stars rating={rating} interactive size={20} onChange={setRating} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us what you thought..."
              rows={4}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-fit bg-neutral-900 px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}