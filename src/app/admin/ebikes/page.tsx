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
  Zap,
  DollarSign,
  Battery,
  Gauge,
} from "lucide-react";

interface EBike {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: number;
  originalPrice: number | null;
  heroImage: string | null;
  badge: string | null;
  status: string;
  order: number;
  specs: {
    range?: string;
    speed?: string;
    weight?: string;
  } | null;
  createdAt: string;
}

export default function EBikesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [ebikes, setEbikes] = useState<EBike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, authStatus, router]);

  useEffect(() => {
    fetchEbikes();
  }, [statusFilter]);

  const fetchEbikes = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const response = await fetch(`/api/admin/ebikes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEbikes(data);
      }
    } catch (error) {
      console.error("Failed to fetch e-bikes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/ebikes/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEbikes(ebikes.filter((e) => e.id !== deleteId));
      }
    } catch (error) {
      console.error("Failed to delete e-bike:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredEbikes = ebikes.filter(
    (ebike) =>
      ebike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ebike.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <span className="text-gray-500 font-medium">Loading e-bikes...</span>
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
            <Zap className="h-6 w-6 text-[#fdc501]" />
            E-Bikes
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your e-bike products
          </p>
        </div>
        <Link href="/admin/ebikes/new">
          <Button className="bg-[#fdc501] text-black hover:bg-[#fdc501]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add E-Bike
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search e-bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "published", "draft", "archived"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "bg-[#1a1a1a] text-white h-9"
                  : "h-9"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* E-Bikes Grid */}
      {filteredEbikes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No e-bikes found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Get started by adding your first e-bike"}
            </p>
            <Link href="/admin/ebikes/new">
              <Button className="bg-[#fdc501] text-black hover:bg-[#fdc501]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add E-Bike
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEbikes.map((ebike) => (
            <Card
              key={ebike.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {ebike.heroImage ? (
                  <Image
                    src={ebike.heroImage}
                    alt={ebike.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Zap className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                {ebike.badge && (
                  <span className="absolute top-3 left-3 bg-[#fdc501] text-black text-xs font-bold px-2 py-1 rounded-full">
                    {ebike.badge}
                  </span>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getStatusBadge(ebike.status)} border`}>
                    {ebike.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {ebike.name}
                    </h3>
                    {ebike.tagline && (
                      <p className="text-sm text-gray-500">{ebike.tagline}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/our-rides/${ebike.slug}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/ebikes/${ebike.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(ebike.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Specs */}
                {ebike.specs && (
                  <div className="flex gap-4 mb-3 text-sm">
                    {ebike.specs.range && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Battery className="h-3.5 w-3.5" />
                        <span>{ebike.specs.range}</span>
                      </div>
                    )}
                    {ebike.specs.speed && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Gauge className="h-3.5 w-3.5" />
                        <span>{ebike.specs.speed}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#fdc501]" />
                  <span className="font-bold text-lg">
                    ${ebike.price.toLocaleString()}
                  </span>
                  {ebike.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ${ebike.originalPrice.toLocaleString()}
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
            <AlertDialogTitle>Delete E-Bike</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this e-bike? This action cannot be
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
