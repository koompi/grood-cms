"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Package,
  Image as ImageIcon,
} from "lucide-react";

interface AccessoryData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  price: string;
  originalPrice: string;
  image: string;
  category: string;
  badge: string;
  rating: string;
  reviewCount: string;
  inStock: boolean;
  status: string;
  order: string;
  seoTitle: string;
  seoDescription: string;
}

const defaultData: AccessoryData = {
  name: "",
  slug: "",
  description: "",
  shortDesc: "",
  price: "",
  originalPrice: "",
  image: "",
  category: "OTHER",
  badge: "",
  rating: "",
  reviewCount: "0",
  inStock: true,
  status: "DRAFT",
  order: "0",
  seoTitle: "",
  seoDescription: "",
};

const categoryOptions = [
  { value: "SAFETY", label: "Safety & Security" },
  { value: "BAGS", label: "Bags & Storage" },
  { value: "COMFORT", label: "Comfort" },
  { value: "TECH", label: "Tech" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

export default function AccessoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AccessoryData>(defaultData);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, authStatus, router]);

  useEffect(() => {
    if (!isNew) {
      fetchAccessory();
    }
  }, [resolvedParams.id]);

  const fetchAccessory = async () => {
    try {
      const response = await fetch(`/api/admin/accessories/${resolvedParams.id}`);
      if (response.ok) {
        const accessory = await response.json();
        setData({
          ...accessory,
          price: accessory.price.toString(),
          originalPrice: accessory.originalPrice?.toString() || "",
          order: accessory.order.toString(),
          rating: accessory.rating?.toString() || "",
          reviewCount: accessory.reviewCount.toString(),
          description: typeof accessory.description === 'object' 
            ? accessory.description?.content?.[0]?.content?.[0]?.text || "" 
            : accessory.description || "",
        });
      } else {
        setError("Accessory not found");
      }
    } catch (err) {
      setError("Failed to load accessory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      // Convert description to Tiptap format
      const descriptionJson = data.description ? {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: data.description }]
          }
        ]
      } : null;

      const payload = {
        ...data,
        description: descriptionJson,
      };

      const response = await fetch(
        isNew ? "/api/admin/accessories" : `/api/admin/accessories/${resolvedParams.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        router.push("/admin/accessories");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to save accessory");
      }
    } catch (err) {
      setError("Failed to save accessory");
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setData({ ...data, slug });
  };

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/accessories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-[#fdc501]" />
              {isNew ? "Add Accessory" : "Edit Accessory"}
            </h1>
            {!isNew && (
              <p className="text-gray-500 text-sm mt-1">
                Editing: {data.name}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#fdc501] text-black hover:bg-[#fdc501]/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      onBlur={() => !data.slug && generateSlug()}
                      placeholder="Grood Helmet"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData({ ...data, slug: e.target.value })}
                        placeholder="grood-helmet"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateSlug}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <Input
                    id="shortDesc"
                    value={data.shortDesc}
                    onChange={(e) => setData({ ...data, shortDesc: e.target.value })}
                    placeholder="Premium safety helmet for urban riders"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="Detailed product description..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={data.price}
                      onChange={(e) => setData({ ...data, price: e.target.value })}
                      placeholder="129"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={data.originalPrice}
                      onChange={(e) => setData({ ...data, originalPrice: e.target.value })}
                      placeholder="149"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={data.badge}
                      onChange={(e) => setData({ ...data, badge: e.target.value })}
                      placeholder="New, Sale, Best Seller"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={data.inStock}
                    onCheckedChange={(checked) => setData({ ...data, inStock: checked as boolean })}
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Average Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={data.rating}
                      onChange={(e) => setData({ ...data, rating: e.target.value })}
                      placeholder="4.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      value={data.reviewCount}
                      onChange={(e) => setData({ ...data, reviewCount: e.target.value })}
                      placeholder="124"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Category */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData({ ...data, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={data.category}
                    onValueChange={(value) => setData({ ...data, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={data.order}
                    onChange={(e) => setData({ ...data, order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.image ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.image}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <Input
                  value={data.image}
                  onChange={(e) => setData({ ...data, image: e.target.value })}
                  placeholder="Image URL"
                />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Meta Title</Label>
                  <Input
                    id="seoTitle"
                    value={data.seoTitle}
                    onChange={(e) => setData({ ...data, seoTitle: e.target.value })}
                    placeholder="Page title for search engines"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={data.seoDescription}
                    onChange={(e) =>
                      setData({ ...data, seoDescription: e.target.value })
                    }
                    placeholder="Page description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
