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

interface FAQForm {
  question: string;
  answer: string;
  category: string;
  order: number;
}

const defaultForm: FAQForm = {
  question: "",
  answer: "",
  category: "GENERAL",
  order: 0,
};

export default function FAQEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<FAQForm>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    if (!isNew) {
      fetchFAQ();
    }
  }, [id, isNew]);

  const fetchFAQ = async () => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          question: data.question || "",
          answer: data.answer || "",
          category: data.category || "GENERAL",
          order: data.order || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/admin/faqs" : `/api/admin/faqs/${id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/admin/faqs");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
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
            {isNew ? "Add FAQ" : "Edit FAQ"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Add a new frequently asked question" : "Update FAQ details"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question & Answer */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Question & Answer</h2>
          
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="How do I maintain my e-bike?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Provide a detailed answer..."
              rows={6}
              required
            />
          </div>
        </div>

        {/* Category & Order */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Organization</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="ORDERING">Ordering</SelectItem>
                  <SelectItem value="SHIPPING">Shipping</SelectItem>
                  <SelectItem value="WARRANTY">Warranty</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>
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
            {saving ? "Saving..." : isNew ? "Create FAQ" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
