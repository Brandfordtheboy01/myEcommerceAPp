"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  product_name: string;
  created_at: string;
}

interface VendorReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function VendorReviews({ reviews, averageRating, totalReviews }: VendorReviewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeReview = reviews[currentIndex];

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  // Get distinct reviewer initials (up to 4)
  const customerInitials = reviews
    .slice(0, 4)
    .map((r) =>
      r.customer
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    )
    .filter((initials) => initials.length > 0);

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
                      className={`size-3.5 ${
                        star <= activeReview.rating
                          ? "fill-current"
                          : "fill-muted stroke-muted-foreground opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <div className="font-medium text-sm">{activeReview.customer}</div>
                  <p className="mt-2 line-clamp-3 min-h-[4.5em] text-muted-foreground text-sm">
                    {activeReview.comment || "No comment left by the buyer."}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    on <span className="font-medium">{activeReview.product_name}</span>
                  </div>
                </div>
              </div>

              {reviews.length > 1 && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    aria-label="Previous review"
                    size="icon"
                    variant="outline"
                    onClick={handlePrev}
                    className="size-7"
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  <Button
                    aria-label="Next review"
                    size="icon"
                    variant="outline"
                    onClick={handleNext}
                    className="size-7"
                  >
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 border border-dashed p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center min-h-[140px]">
            No reviews have been left for your products yet.
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="font-medium text-sm">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
            <div className="line-clamp-2 min-h-[3em] text-muted-foreground text-xs flex items-center">
              Customer reviews for your listed catalog items
            </div>
          </div>

          {customerInitials.length > 0 && (
            <AvatarGroup>
              {customerInitials.map((initials, index) => (
                <Avatar key={index}>
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
