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

interface Store {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  hours: string | null;
  services: string[];
  image: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  featured: boolean;
}

const storeTypes = [
  { value: "all", label: "All Types" },
  { value: "BRAND_STORE", label: "Brand Store" },
  { value: "SERVICE_POINT", label: "Service Point" },
];

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    fetchStores();
  }, [typeFilter, search]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/stores?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/admin/stores/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStores(stores.filter((s) => s.id !== deleteId));
      }
    } catch (error) {
      console.error("Error deleting store:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "COMING_SOON":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "BRAND_STORE":
        return <Badge className="bg-[#fdc501]/10 text-[#fdc501] border-[#fdc501]/20">Brand Store</Badge>;
      case "SERVICE_POINT":
        return <Badge variant="outline">Service Point</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground mt-1">
            Manage brand stores and service points
          </p>
        </div>
        <Link href="/admin/stores/new">
          <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Store
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {storeTypes.map((type) => (
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
      </div>

      {/* Stores List */}
      {stores.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No stores found</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first store location.</p>
          <Link href="/admin/stores/new">
            <Button className="bg-[#fdc501] hover:bg-[#e3b001] text-black">Add Store</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex items-start gap-4 p-4 bg-card rounded-lg border hover:border-[#fdc501]/30 transition-colors"
            >
              {/* Store Image */}
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {store.image ? (
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{store.name}</h3>
                      {store.featured && (
                        <Badge className="bg-[#fdc501]/10 text-[#fdc501] border-[#fdc501]/20">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {store.address}, {store.city}, {store.country}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(store.type)}
                    {getStatusBadge(store.status)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  {store.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {store.phone}
                    </span>
                  )}
                  {store.email && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {store.email}
                    </span>
                  )}
                  {store.hours && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {store.hours}
                    </span>
                  )}
                </div>

                {/* Services */}
                {store.services && store.services.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {store.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/admin/stores/${store.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(store.id)}
                  className="text-red-500 hover:text-red-600 hover:border-red-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this store? This action cannot be undone.
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
