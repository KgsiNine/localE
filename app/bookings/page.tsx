"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { RouteGuard } from "@/components/auth/route-guard";
import { bookingsAPI } from "@/lib/api";
import type { Booking } from "@/lib/types";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  AlertCircle,
  Hash,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

function BookingsPageContent() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadBookings = async () => {
      try {
        const userBookings = await bookingsAPI.getAllBookings();
        setAllBookings(userBookings);
        setBookings(userBookings.sort((a, b) => b.bookingDate - a.bookingDate));
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [currentUser]);

  // Filter and sort bookings
  useEffect(() => {
    let filtered = [...allBookings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.visitorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.bookingDate - a.bookingDate);
        break;
      case "oldest":
        filtered.sort((a, b) => a.bookingDate - b.bookingDate);
        break;
      case "scheduled":
        filtered.sort(
          (a, b) =>
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime()
        );
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        filtered.sort((a, b) => b.bookingDate - a.bookingDate);
    }

    setBookings(filtered);
  }, [allBookings, searchQuery, statusFilter, sortBy]);

  const handleStatusChange = async (
    booking: Booking,
    newStatus: Booking["status"]
  ) => {
    try {
      const updatedBooking = await bookingsAPI.updateBooking(booking.id, {
        status: newStatus,
      });
      const updated = allBookings.map((b) =>
        b.id === booking.id ? updatedBooking : b
      );
      setAllBookings(updated);
      setBookings(updated);
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  // Calculate statistics for promoters
  const getBookingStats = () => {
    if (currentUser?.role !== "promoter") return null;

    const total = allBookings.length;
    const pending = allBookings.filter((b) => b.status === "pending").length;
    const confirmed = allBookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    const cancelled = allBookings.filter(
      (b) => b.status === "cancelled"
    ).length;
    const totalRevenue = allBookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + b.price, 0);

    return { total, pending, confirmed, cancelled, totalRevenue };
  };

  const stats = getBookingStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/50";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/50";
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentUser?.role === "visitor"
              ? "My Bookings"
              : "Booking Requests"}
          </h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "visitor"
              ? "View and manage your place bookings"
              : "Manage booking requests from visitors"}
          </p>
        </div>

        {/* Statistics Dashboard for Promoters */}
        {currentUser?.role === "promoter" && stats && stats.total > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock3 className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting action</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </div>
                <p className="text-xs text-muted-foreground">Active bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                <p className="text-xs text-muted-foreground">
                  From confirmed bookings
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search for Promoters */}
        {currentUser?.role === "promoter" && allBookings.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
              <div className="space-y-2">
                <Label htmlFor="search">Search Bookings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by place, visitor, or package..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="scheduled">Scheduled Date</SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {bookings.length} of {allBookings.length} booking
              {allBookings.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                {currentUser?.role === "visitor"
                  ? "Start exploring places and make your first booking"
                  : "Bookings from visitors will appear here"}
              </p>
              {currentUser?.role === "visitor" && (
                <Button asChild>
                  <Link href="/?category=bookable">Browse Places</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="mb-1">
                        {booking.placeName}
                      </CardTitle>
                      <CardDescription>
                        {booking.checkInTime
                          ? "Restaurant Booking"
                          : booking.startDate
                          ? "Mountain Booking"
                          : booking.checkInDate
                          ? "Hotel Booking"
                          : "Direct Booking"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(booking.status)}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      {currentUser?.role === "promoter" && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Visitor: {booking.visitorName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Scheduled:{" "}
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      {booking.checkInTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Check-in Time: {booking.checkInTime}</span>
                        </div>
                      )}
                      {booking.tableNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span>Table: {booking.tableNumber}</span>
                        </div>
                      )}
                      {booking.startDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Start Date:{" "}
                            {new Date(booking.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {booking.endDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            End Date:{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {booking.numberOfSlots && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span>Slots: {booking.numberOfSlots}</span>
                        </div>
                      )}
                      {booking.checkInDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Check-in:{" "}
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {booking.checkOutDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Check-out:{" "}
                            {new Date(
                              booking.checkOutDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {booking.selectedRoomIds &&
                        booking.selectedRoomIds.length > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span>
                              Rooms: {booking.selectedRoomIds.join(", ")}
                            </span>
                          </div>
                        )}
                      {booking.duration > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {booking.duration} minutes</span>
                        </div>
                      )}
                      {booking.price > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Price: ${booking.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        Booked: {new Date(booking.bookingDate).toLocaleString()}
                      </p>

                      {currentUser?.role === "promoter" && (
                        <div className="space-y-2 mt-2">
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking, "confirmed")
                                }
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusChange(booking, "cancelled")
                                }
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleStatusChange(booking, "cancelled")
                              }
                              className="w-full"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </Button>
                          )}
                          {booking.status === "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusChange(booking, "pending")
                              }
                              className="w-full"
                            >
                              <Clock3 className="h-4 w-4 mr-2" />
                              Reset to Pending
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="w-full"
                          >
                            <Link href={`/place/${booking.placeId}`}>
                              <MapPin className="h-4 w-4 mr-2" />
                              View Place
                            </Link>
                          </Button>
                        </div>
                      )}

                      {currentUser?.role === "visitor" && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="mt-2 bg-transparent"
                        >
                          <Link href={`/place/${booking.placeId}`}>
                            <MapPin className="h-4 w-4 mr-2" />
                            View Place
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <BookingsPageContent />
    </RouteGuard>
  );
}
