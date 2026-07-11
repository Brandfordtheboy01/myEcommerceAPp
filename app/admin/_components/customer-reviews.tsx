"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewRow {
  id: string;
  customer: string;
  rating: number;
  comment: string;
}

interface CustomerReviewsProps {
  reviews: ReviewRow[];
  averageRating: number;
  totalReviews: number;
}

export function CustomerReviews({ reviews, averageRating, totalReviews }: CustomerReviewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeReview = reviews[currentIndex];

  const handlePrev = () => {
    if (!reviews.length) return;
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!reviews.length) return;
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const customerInitials = reviews
    .slice(0, 4)
    .map((r) =>
      r.customer
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    );

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Reviews</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {averageRating > 0 ? `${averageRating.toFixed(1)} average rating` : "No reviews yet"}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {activeReview ? (
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-0.5 text-foreground">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-3.5 ${star <= activeReview.rating ? "fill-current" : "fill-muted stroke-muted-foreground opacity-30"}`}
                    />
                  ))}
                </div>
                <div>
                  <div className="font-medium text-sm">{activeReview.customer}</div>
                  <p className="mt-2 line-clamp-3 min-h-[4.5em] text-muted-foreground text-sm">
                    {activeReview.comment || "No comment provided."}
                  </p>
                </div>
              </div>

              {reviews.length > 1 && (
                <div className="flex gap-1 shrink-0">
                  <Button aria-label="Previous review" size="icon" variant="outline" onClick={handlePrev}>
                    <ArrowLeft />
                  </Button>
                  <Button aria-label="Next review" size="icon" variant="outline" onClick={handleNext}>
                    <ArrowRight />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No reviews yet.
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="font-medium text-sm">{totalReviews.toLocaleString()} reviews</div>
            <div className="line-clamp-2 min-h-[3em] text-muted-foreground text-xs">Customer reviews across all products</div>
          </div>

          {customerInitials.length > 0 && (
            <AvatarGroup>
              {customerInitials.map((initials, i) => (
                <Avatar key={i}>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
              {totalReviews > 4 && <AvatarGroupCount>+{totalReviews - 4}</AvatarGroupCount>}
            </AvatarGroup>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
