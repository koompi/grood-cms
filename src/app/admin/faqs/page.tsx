"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const faqCategories = [
  { value: "all", label: "All Categories" },
  { value: "GENERAL", label: "General" },
  { value: "PRODUCT", label: "Product" },
  { value: "ORDERING", label: "Ordering" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "WARRANTY", label: "Warranty" },
  { value: "SERVICE", label: "Service" },
];

export default function FAQsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    fetchFAQs();
  }, [categoryFilter, search]);

  const fetchFAQs = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/faqs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/admin/faqs/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFaqs(faqs.filter((f) => f.id !== deleteId));
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      GENERAL: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      PRODUCT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      ORDERING: "bg-green-500/10 text-green-500 border-green-500/20",
      SHIPPING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      WARRANTY: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      SERVICE: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };
    return (
      <Badge className={colors[category] || "bg-gray-500/10 text-gray-500"}>
        {category.charAt(0) + category.slice(1).toLowerCase()}
      </Badge>
    );
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    const cat = faq.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

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
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground mt-1">
            Manage frequently asked questions
          </p>
        </div>
        <Link href="/admin/faqs/new">
          <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add FAQ
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-gray-200">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {faqCategories.map((cat) => (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat.value)}
              className={categoryFilter === cat.value ? "bg-[#fdc501] hover:bg-[#e3b001] text-black h-9" : "h-9"}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {faqs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No FAQs found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first frequently asked question.</p>
          <Link href="/admin/faqs/new">
            <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">Add FAQ</Button>
          </Link>
        </div>
      ) : categoryFilter === "all" ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                {getCategoryBadge(category)}
                <span className="text-sm text-muted-foreground">
                  {categoryFaqs.length} question{categoryFaqs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-card rounded-lg border p-4 hover:border-[#fdc501]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/admin/faqs/${faq.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(faq.id)}
                          className="text-red-500 hover:text-red-600 hover:border-red-500"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat view for filtered
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card rounded-lg border p-4 hover:border-[#fdc501]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{faq.question}</h3>
                    {getCategoryBadge(faq.category)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/faqs/${faq.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(faq.id)}
                    className="text-red-500 hover:text-red-600 hover:border-red-500"
                  >
                    Delete
                  </Button>
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
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
