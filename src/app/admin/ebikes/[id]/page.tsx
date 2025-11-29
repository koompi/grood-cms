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
  Zap,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";

interface Color {
  name: string;
  hex: string;
  image: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface EBikeData {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: string;
  originalPrice: string;
  heroImage: string;
  galleryImages: string[];
  colors: Color[];
  specs: {
    range: string;
    speed: string;
    weight: string;
    battery: string;
    motor: string;
    chargeTime: string;
    gears: string;
  };
  features: Feature[];
  badge: string;
  status: string;
  order: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

const defaultData: EBikeData = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  price: "",
  originalPrice: "",
  heroImage: "",
  galleryImages: [],
  colors: [],
  specs: {
    range: "",
    speed: "",
    weight: "",
    battery: "",
    motor: "",
    chargeTime: "",
    gears: "",
  },
  features: [],
  badge: "",
  status: "DRAFT",
  order: "0",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
};

export default function EBikeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<EBikeData>(defaultData);
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
      fetchEbike();
    }
  }, [resolvedParams.id]);

  const fetchEbike = async () => {
    try {
      const response = await fetch(`/api/admin/ebikes/${resolvedParams.id}`);
      if (response.ok) {
        const ebike = await response.json();
        setData({
          ...ebike,
          price: ebike.price.toString(),
          originalPrice: ebike.originalPrice?.toString() || "",
          order: ebike.order.toString(),
          galleryImages: ebike.galleryImages || [],
          colors: ebike.colors || [],
          specs: ebike.specs || defaultData.specs,
          features: ebike.features || [],
          description: typeof ebike.description === 'object' 
            ? ebike.description?.content?.[0]?.content?.[0]?.text || "" 
            : ebike.description || "",
        });
      } else {
        setError("E-bike not found");
      }
    } catch (err) {
      setError("Failed to load e-bike");
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
        galleryImages: data.galleryImages.filter(Boolean),
        colors: data.colors.filter(c => c.name && c.hex),
        features: data.features.filter(f => f.title),
      };

      const response = await fetch(
        isNew ? "/api/admin/ebikes" : `/api/admin/ebikes/${resolvedParams.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        router.push("/admin/ebikes");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to save e-bike");
      }
    } catch (err) {
      setError("Failed to save e-bike");
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

  const addColor = () => {
    setData({
      ...data,
      colors: [...data.colors, { name: "", hex: "#000000", image: "" }],
    });
  };

  const updateColor = (index: number, field: keyof Color, value: string) => {
    const newColors = [...data.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setData({ ...data, colors: newColors });
  };

  const removeColor = (index: number) => {
    setData({ ...data, colors: data.colors.filter((_, i) => i !== index) });
  };

  const addFeature = () => {
    setData({
      ...data,
      features: [...data.features, { icon: "Zap", title: "", description: "" }],
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setData({ ...data, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setData({ ...data, features: data.features.filter((_, i) => i !== index) });
  };

  const addGalleryImage = () => {
    setData({ ...data, galleryImages: [...data.galleryImages, ""] });
  };

  const updateGalleryImage = (index: number, value: string) => {
    const newImages = [...data.galleryImages];
    newImages[index] = value;
    setData({ ...data, galleryImages: newImages });
  };

  const removeGalleryImage = (index: number) => {
    setData({
      ...data,
      galleryImages: data.galleryImages.filter((_, i) => i !== index),
    });
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
          <Link href="/admin/ebikes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#fdc501]" />
              {isNew ? "Add E-Bike" : "Edit E-Bike"}
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
                      placeholder="Grood S1"
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
                        placeholder="grood-s1"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateSlug}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={data.tagline}
                    onChange={(e) => setData({ ...data, tagline: e.target.value })}
                    placeholder="Our flagship city bike"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="The iconic straight frame, re-engineered for the modern city..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
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
                      placeholder="2498"
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
                      placeholder="2698"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Input
                      id="badge"
                      value={data.badge}
                      onChange={(e) => setData({ ...data, badge: e.target.value })}
                      placeholder="Best Seller"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="range">Range</Label>
                    <Input
                      id="range"
                      value={data.specs.range}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, range: e.target.value },
                        })
                      }
                      placeholder="150 km"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="speed">Top Speed</Label>
                    <Input
                      id="speed"
                      value={data.specs.speed}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, speed: e.target.value },
                        })
                      }
                      placeholder="25 km/h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={data.specs.weight}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, weight: e.target.value },
                        })
                      }
                      placeholder="21 kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery">Battery</Label>
                    <Input
                      id="battery"
                      value={data.specs.battery}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, battery: e.target.value },
                        })
                      }
                      placeholder="504 Wh"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motor">Motor</Label>
                    <Input
                      id="motor"
                      value={data.specs.motor}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, motor: e.target.value },
                        })
                      }
                      placeholder="250W front hub"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chargeTime">Charge Time</Label>
                    <Input
                      id="chargeTime"
                      value={data.specs.chargeTime}
                      onChange={(e) =>
                        setData({
                          ...data,
                          specs: { ...data.specs, chargeTime: e.target.value },
                        })
                      }
                      placeholder="4 hours"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Color Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addColor}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Color
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.colors.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No colors added yet
                  </p>
                ) : (
                  data.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid sm:grid-cols-3 gap-3">
                        <Input
                          value={color.name}
                          onChange={(e) => updateColor(index, "name", e.target.value)}
                          placeholder="Matte Black"
                        />
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={color.hex}
                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                            placeholder="#1a1a1a"
                          />
                        </div>
                        <Input
                          value={color.image}
                          onChange={(e) => updateColor(index, "image", e.target.value)}
                          placeholder="Image URL"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Features</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.features.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No features added yet
                  </p>
                ) : (
                  data.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="grid sm:grid-cols-2 gap-2">
                          <Input
                            value={feature.title}
                            onChange={(e) =>
                              updateFeature(index, "title", e.target.value)
                            }
                            placeholder="Feature title"
                          />
                          <Input
                            value={feature.icon}
                            onChange={(e) =>
                              updateFeature(index, "icon", e.target.value)
                            }
                            placeholder="Icon name (e.g., Zap)"
                          />
                        </div>
                        <Input
                          value={feature.description}
                          onChange={(e) =>
                            updateFeature(index, "description", e.target.value)
                          }
                          placeholder="Feature description"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Order */}
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

            {/* Hero Image */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.heroImage ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.heroImage}
                      alt="Hero"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <Input
                  value={data.heroImage}
                  onChange={(e) => setData({ ...data, heroImage: e.target.value })}
                  placeholder="Image URL"
                />
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gallery</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGalleryImage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.galleryImages.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => updateGalleryImage(index, e.target.value)}
                      placeholder="Image URL"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGalleryImage(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
