"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  DollarSign,
} from "lucide-react";

interface Accessory {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string;
  badge: string | null;
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  status: string;
  order: number;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  SAFETY: "Safety & Security",
  BAGS: "Bags & Storage",
  COMFORT: "Comfort",
  TECH: "Tech",
  MAINTENANCE: "Maintenance",
  OTHER: "Other",
};

export default function AccessoriesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, authStatus, router]);

  useEffect(() => {
    fetchAccessories();
  }, [statusFilter, categoryFilter]);

  const fetchAccessories = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      
      const response = await fetch(`/api/admin/accessories?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAccessories(data);
      }
    } catch (error) {
      console.error("Failed to fetch accessories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/accessories/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAccessories(accessories.filter((a) => a.id !== deleteId));
      }
    } catch (error) {
      console.error("Failed to delete accessory:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredAccessories = accessories.filter(
    (accessory) =>
      accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accessory.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
      ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#fdc501] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading accessories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-[#fdc501]" />
            Accessories
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your accessory products
          </p>
        </div>
        <Link href="/admin/accessories/new">
          <Button className="bg-[#fdc501] text-black hover:bg-[#fdc501]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Accessory
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 py-3 border-b border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <div className="flex gap-1.5">
            {["all", "published", "draft"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? "bg-[#1a1a1a] text-white h-8" : "h-8"}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          <div className="flex gap-1.5 flex-wrap">
            {["all", ...Object.keys(categoryLabels)].map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={categoryFilter === cat ? "bg-[#fdc501] text-black hover:bg-[#fdc501]/90 h-8" : "h-8"}
              >
                {cat === "all" ? "All Categories" : categoryLabels[cat]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Accessories Grid */}
      {filteredAccessories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No accessories found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Get started by adding your first accessory"}
            </p>
            <Link href="/admin/accessories/new">
              <Button className="bg-[#fdc501] text-black hover:bg-[#fdc501]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Accessory
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAccessories.map((accessory) => (
            <Card
              key={accessory.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative aspect-square bg-gray-100">
                {accessory.image ? (
                  <Image
                    src={accessory.image}
                    alt={accessory.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {accessory.badge && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${
                      accessory.badge === "Sale"
                        ? "bg-red-500 text-white"
                        : accessory.badge === "New"
                        ? "bg-[#fdc501] text-black"
                        : "bg-black text-white"
                    }`}
                  >
                    {accessory.badge}
                  </span>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${getStatusBadge(accessory.status)} border text-xs`}>
                    {accessory.status}
                  </Badge>
                </div>
                {!accessory.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {categoryLabels[accessory.category]}
                    </span>
                    <h3 className="font-medium text-gray-900 truncate">
                      {accessory.name}
                    </h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/accessories/${accessory.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/accessories/${accessory.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(accessory.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Rating */}
                {accessory.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-[#fdc501] text-[#fdc501]" />
                    <span className="text-sm text-gray-600">{accessory.rating}</span>
                    <span className="text-xs text-gray-400">({accessory.reviewCount})</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    ${accessory.price.toLocaleString()}
                  </span>
                  {accessory.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ${accessory.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Accessory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this accessory? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
