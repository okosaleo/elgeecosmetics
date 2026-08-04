import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteReview } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { ReviewApprovalToggle } from "./review-approval-toggle";
import { DeleteButton } from "@/components/delete-button";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <HugeiconsIcon icon={StarIcon}
          key={n}
          width={13}
          height={13}
          fill={n <= rating ? "#171717" : "none"}
          stroke="#171717"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "pending" } = await searchParams;

  const where =
    filter === "pending"
      ? { approved: false }
      : filter === "approved"
      ? { approved: true }
      : {};

  const reviews = await prisma.review.findMany({
    where,
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = await prisma.review.count({ where: { approved: false } });

  const tabs = [
    { key: "pending", label: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
    { key: "approved", label: "Approved" },
    { key: "all", label: "All" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Reviews</h1>

      <div className="mb-6 flex gap-1 border-b border-neutral-200">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/reviews?filter=${tab.key}`}
            className={`px-3 py-2 text-sm font-medium ${
              filter === tab.key
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
          {filter === "pending" ? "No reviews waiting on approval." : "No reviews here."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/shop/${r.product.slug}`}
                    className="text-sm font-medium text-neutral-800 hover:underline"
                  >
                    {r.product.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-neutral-400">
                      {r.user.name} · {r.user.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ReviewApprovalToggle reviewId={r.id} approved={r.approved} />
                  <DeleteButton
                    id={r.id}
                    action={deleteReview}
                    confirmMessage="Delete this review? This can't be undone."
                  />
                </div>
              </div>

              {r.title && (
                <p className="text-sm font-medium text-neutral-900">{r.title}</p>
              )}
              {r.body && (
                <p className="text-sm leading-relaxed text-neutral-600">{r.body}</p>
              )}
              <p className="text-xs text-neutral-400">
                {r.createdAt.toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}