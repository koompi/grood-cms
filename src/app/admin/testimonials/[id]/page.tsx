"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface TestimonialForm {
  name: string;
  role: string;
  location: string;
  content: string;
  avatar: string;
  rating: number;
  type: string;
  bikeModel: string;
  featured: boolean;
  videoUrl: string;
}

const defaultForm: TestimonialForm = {
  name: "",
  role: "",
  location: "",
  content: "",
  avatar: "",
  rating: 5,
  type: "TEXT",
  bikeModel: "",
  featured: false,
  videoUrl: "",
};

export default function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<TestimonialForm>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    if (!isNew) {
      fetchTestimonial();
    }
  }, [id, isNew]);

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          name: data.name || "",
          role: data.role || "",
          location: data.location || "",
          content: data.content || "",
          avatar: data.avatar || "",
          rating: data.rating || 5,
          type: data.type || "TEXT",
          bikeModel: data.bikeModel || "",
          featured: data.featured || false,
          videoUrl: data.videoUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching testimonial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/admin/testimonials" : `/api/admin/testimonials/${id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/admin/testimonials");
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fdc501]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? "Add Testimonial" : "Edit Testimonial"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Add a new customer testimonial" : "Update testimonial details"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Customer Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Title</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Daily Commuter"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Phnom Penh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Testimonial Content</h2>
          
          <div className="space-y-2">
            <Label htmlFor="content">Review Content *</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Share the customer's experience..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={form.rating.toString()}
                onValueChange={(value) => setForm({ ...form, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {"★".repeat(rating)}{"☆".repeat(5 - rating)} ({rating}/5)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bikeModel">Bike Model</Label>
              <Input
                id="bikeModel"
                value={form.bikeModel}
                onChange={(e) => setForm({ ...form, bikeModel: e.target.value })}
                placeholder="Grood X5"
              />
            </div>
          </div>
        </div>

        {/* Type & Settings */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Type & Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Testimonial Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => 
                    setForm({ ...form, featured: checked as boolean })
                  }
                />
                <Label htmlFor="featured">Featured Testimonial</Label>
              </div>
            </div>
          </div>

          {form.type === "VIDEO" && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#fdc501] hover:bg-[#e3b001] text-black"
          >
            {saving ? "Saving..." : isNew ? "Create Testimonial" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
