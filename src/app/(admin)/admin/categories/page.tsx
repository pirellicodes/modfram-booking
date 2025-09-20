"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Workshop",
      description: "Hands-on learning sessions",
      color: "blue",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Conference",
      description: "Large group presentations",
      color: "green",
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Seminar",
      description: "Educational discussions",
      color: "purple",
      createdAt: new Date(),
    },
    {
      id: "4",
      name: "Social",
      description: "Team building and networking",
      color: "orange",
      createdAt: new Date(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
  });

  const colors = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "red", label: "Red" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
    { value: "pink", label: "Pink" },
    { value: "indigo", label: "Indigo" },
  ];

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        color: "blue",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "blue" });
  };

  const saveCategory = () => {
    if (
      !formData.name.trim(
      )
    ) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      // Update existing category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData }
            : cat
        )
      );
      toast.success("Category updated successfully");
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success("Category created successfully");
    }

    closeDialog();
  };

  const deleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success("Category deleted successfully"
      );
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      red: "bg-red-100 text-red-800 border-red-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage categories for organizing your events and sessions.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge className={getColorClasses(category.color)}>
                    {category.color}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openDialog(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {category.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No categories yet. Create your first category to get started.
            </p>
          </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>{editingCategory
                ? "Update the category details below."
                : "Add a new category to organize your events and sessions."
              }</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Workshop, Meeting, Training"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of this category"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: `var(--${color.value}-500)` }}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={!formData.name.trim()}>
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
