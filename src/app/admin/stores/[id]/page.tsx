"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface StoreForm {
  name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  hours: string;
  services: string[];
  image: string;
  lat: string;
  lng: string;
  status: string;
  featured: boolean;
}

const defaultForm: StoreForm = {
  name: "",
  type: "SERVICE_POINT",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  hours: "",
  services: [],
  image: "",
  lat: "",
  lng: "",
  status: "ACTIVE",
  featured: false,
};

const commonServices = [
  "Test Rides",
  "Repairs",
  "Maintenance",
  "Accessories",
  "Battery Service",
  "Software Updates",
  "Pick-up Point",
  "Custom Fitting",
];

export default function StoreEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<StoreForm>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    if (!isNew) {
      fetchStore();
    }
  }, [id, isNew]);

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/admin/stores/${id}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          name: data.name || "",
          type: data.type || "SERVICE_POINT",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          phone: data.phone || "",
          email: data.email || "",
          hours: data.hours || "",
          services: data.services || [],
          image: data.image || "",
          lat: data.lat?.toString() || "",
          lng: data.lng?.toString() || "",
          status: data.status || "ACTIVE",
          featured: data.featured || false,
        });
      }
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/admin/stores" : `/api/admin/stores/${id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/admin/stores");
      }
    } catch (error) {
      console.error("Error saving store:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const addCustomService = () => {
    if (newService.trim() && !form.services.includes(newService.trim())) {
      setForm((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? "Add Store" : "Edit Store"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Add a new store location" : "Update store information"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Grood Phnom Penh"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Store Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRAND_STORE">Brand Store</SelectItem>
                  <SelectItem value="SERVICE_POINT">Service Point</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
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
                <Label htmlFor="featured">Featured Store</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Store Image URL</Label>
            <Input
              id="image"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/store-image.jpg"
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Address</h2>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Monivong Blvd"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Phnom Penh"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Cambodia"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="11.5564"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="104.9282"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+855 23 123 456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="store@grood.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Opening Hours</Label>
            <Input
              id="hours"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              placeholder="Mon-Sat 9:00-18:00"
            />
          </div>
        </div>

        {/* Services */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Services</h2>
          
          <div className="flex flex-wrap gap-2">
            {commonServices.map((service) => (
              <Badge
                key={service}
                variant={form.services.includes(service) ? "default" : "outline"}
                className={`cursor-pointer ${
                  form.services.includes(service)
                    ? "bg-[#fdc501] hover:bg-[#e3b001] text-black"
                    : "hover:bg-muted"
                }`}
                onClick={() => toggleService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>

          {/* Custom services */}
          {form.services.filter((s) => !commonServices.includes(s)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {form.services
                .filter((s) => !commonServices.includes(s))
                .map((service) => (
                  <Badge
                    key={service}
                    className="bg-[#fdc501] hover:bg-[#e3b001] text-black cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    {service} ×
                  </Badge>
                ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add custom service..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomService();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCustomService}
            >
              Add
            </Button>
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
            {saving ? "Saving..." : isNew ? "Create Store" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
