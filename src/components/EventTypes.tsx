"use client";

import { useState } from "react";
import { useEventTypes } from "@/hooks/use-dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpenIcon,
  PlusIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  ClockIcon,
  DollarSignIcon,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function EventTypes() {
  const { data: eventTypes, loading, error } = useEventTypes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<{
    id: string;
    name: string;
    duration_minutes: number;
    description: string | null;
    price_cents: number | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: "",
    description: "",
    price_cents: "",
  });

  const handleCreateEventType = () => {
    // TODO: Implement create functionality with Supabase
    console.log("Creating event type:", formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditEventType = (eventType: {
    id: string;
    name: string;
    duration_minutes: number;
    description: string | null;
    price_cents: number | null;
  }) => {
    setSelectedEventType(eventType);
    setFormData({
      name: eventType.name,
      duration_minutes: eventType.duration_minutes.toString(),
      description: eventType.description || "",
      price_cents: eventType.price_cents
        ? (eventType.price_cents / 100).toString()
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEventType = () => {
    // TODO: Implement update functionality with Supabase
    console.log("Updating event type:", selectedEventType.id, formData);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteEventType = (eventType: { id: string }) => {
    // TODO: Implement delete functionality with Supabase
    console.log("Deleting event type:", eventType.id);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      duration_minutes: "",
      description: "",
      price_cents: "",
    });
    setSelectedEventType(null);
  };

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Event Types</h2>
            <p className="text-muted-foreground">
              Manage your booking event types
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Event Types</h2>
            <p className="text-muted-foreground">
              Manage your booking event types
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BookOpenIcon className="h-6 w-6" />
            Event Types
          </h2>
          <p className="text-muted-foreground">
            Manage your booking event types and their settings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Event Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Type</DialogTitle>
              <DialogDescription>
                Create a new event type for your booking system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., Strategy Session"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="60"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price_cents}
                  onChange={(e) =>
                    setFormData({ ...formData, price_cents: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="0 for free"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Describe this event type..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEventType}>Create Event Type</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Event Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Event Types</CardTitle>
          <CardDescription>
            {eventTypes.length} event type{eventTypes.length !== 1 ? "s" : ""}{" "}
            configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventTypes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No event types
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first event type.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Event Type
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypes.map((eventType) => (
                  <TableRow key={eventType.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{eventType.name}</div>
                        {eventType.description && (
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            {eventType.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(eventType.duration_minutes)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        {formatCurrency(eventType.price_cents)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(new Date(eventType.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditEventType(eventType)}
                          >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteEventType(eventType)}
                            className="text-destructive"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Type</DialogTitle>
            <DialogDescription>
              Update the details of your event type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Duration (min)
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price_cents}
                onChange={(e) =>
                  setFormData({ ...formData, price_cents: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEventType}>Update Event Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
