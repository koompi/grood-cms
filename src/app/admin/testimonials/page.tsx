"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  content: string;
  avatar: string | null;
  rating: number;
  type: string;
  bikeModel: string | null;
  featured: boolean;
  videoUrl: string | null;
}

const testimonialTypes = [
  { value: "all", label: "All Types" },
  { value: "TEXT", label: "Text" },
  { value: "VIDEO", label: "Video" },
];

export default function TestimonialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFeatured, setShowFeatured] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    fetchTestimonials();
  }, [typeFilter, showFeatured]);

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (showFeatured) params.append("featured", "true");

      const response = await fetch(`/api/admin/testimonials?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/admin/testimonials/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== deleteId));
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-[#fdc501]" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fdc501]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer reviews and testimonials
          </p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Testimonial
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {testimonialTypes.map((type) => (
            <Button
              key={type.value}
              variant={typeFilter === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type.value)}
              className={typeFilter === type.value ? "bg-[#fdc501] hover:bg-[#e3b001] text-black" : ""}
            >
              {type.label}
            </Button>
          ))}
        </div>
        <Button
          variant={showFeatured ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFeatured(!showFeatured)}
          className={showFeatured ? "bg-[#fdc501] hover:bg-[#e3b001] text-black" : ""}
        >
          Featured Only
        </Button>
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No testimonials found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first customer testimonial.</p>
          <Link href="/admin/testimonials/new">
            <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">Add Testimonial</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-lg border p-5 hover:border-[#fdc501]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        {testimonial.featured && (
                          <Badge className="bg-[#fdc501]/10 text-[#fdc501] border-[#fdc501]/20">Featured</Badge>
                        )}
                        {testimonial.type === "VIDEO" && (
                          <Badge variant="outline">Video</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role && <span>{testimonial.role}</span>}
                        {testimonial.role && testimonial.location && <span> • </span>}
                        {testimonial.location && <span>{testimonial.location}</span>}
                      </div>
                    </div>
                    {renderStars(testimonial.rating)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    "{testimonial.content}"
                  </p>

                  {testimonial.bikeModel && (
                    <Badge variant="secondary" className="mb-3">
                      {testimonial.bikeModel}
                    </Badge>
                  )}

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/testimonials/${testimonial.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(testimonial.id)}
                      className="text-red-500 hover:text-red-600 hover:border-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
