"use client";

import { useState } from "react";
import {  Button  } from "@repo/ui";
import {  Input  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Switch  } from "@repo/ui";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
 } from "@repo/ui";
import { showToast } from "@/lib/toast";
import { LocationSelector } from "@repo/ui";
import { MapPin, Save, X, Trash2 } from "lucide-react";

interface Address {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  default: boolean;
  type?: string;
  phone?: string;
  subArea?: string;
  countryCode?: string;
  stateCode?: string;
}

interface AddressEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  userId: string;
  onAddressChange?: () => void;
}

export default function AddressEditSidebar({
  isOpen,
  onClose,
  address,
  userId,
  onAddressChange,
}: AddressEditSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<Address>({
    _id: address?._id || "",
    name: address?.name || "",
    address: address?.address || "",
    city: address?.city || "",
    state: address?.state || "",
    zip: address?.zip || "",
    country: address?.country || "",
    countryCode: address?.countryCode || "",
    stateCode: address?.stateCode || "",
    subArea: address?.subArea || "",
    default: address?.default || false,
    type: address?.type || "home",
    phone: address?.phone || "",
  });

  const isEditing = !!address?._id;

  const handleLocationChange = (location: {
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
    subArea?: string;
    zipCode?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      country: location.country,
      countryCode: location.countryCode,
      state: location.state,
      stateCode: location.stateCode,
      city: location.city,
      subArea: location.subArea || "",
      zip: location.zipCode || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.country
    ) {
      showToast.error(
        "Validation Error",
        "Please fill in all required fields including location details."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/addresses", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(
          isEditing ? "Address Updated" : "Address Added",
          `Your address has been successfully ${
            isEditing ? "updated" : "added"
          }.`
        );
        onClose();
        if (onAddressChange) {
          onAddressChange();
        }
      } else {
        console.error("API Error:", result);
        throw new Error(
          result.error ||
            `Failed to ${isEditing ? "update" : "create"} address`
        );
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast.error(
        "Error",
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} address`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!address?._id) return;

    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/user/addresses?id=${address._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success(
          "Address Deleted",
          "Your address has been successfully deleted."
        );
        onClose();
        if (onAddressChange) {
          onAddressChange();
        }
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast.error("Error", "Failed to delete address. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-l border-ushop-pink/20">
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-ushop-pink/15">
          <SheetTitle className="flex items-center space-x-2 text-ushop-purple-dark font-bold text-xl">
            <MapPin className="h-5 w-5 text-ushop-pink" />
            <span>{isEditing ? "Edit" : "Add"} Shipping Address</span>
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-sm">
            {isEditing
              ? "Update your shipping address information."
              : "Add a new shipping address to your account."}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-ushop-purple-dark">
                Address Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Home, Office, Mom's House"
                required
                className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-ushop-purple-dark">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="e.g., (555) 123-4567"
                className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
              />
            </div>

            {/* Address Type */}
            <div>
              <Label htmlFor="type" className="text-sm font-semibold text-ushop-purple-dark">
                Address Type
              </Label>
              <select
                id="type"
                value={(formData.type as string) === "office" ? "work" : formData.type}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "home" | "work" | "school" | "other"
                  )
                }
                className="mt-1 flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-ushop-pink focus:outline-none focus:ring-2 focus:ring-ushop-pink/20"
              >
                <option value="home">Home</option>
                <option value="work">Work / Office</option>
                <option value="school">School / Campus</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Street Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-semibold text-ushop-purple-dark">
                Street Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your street address (house number, street name, apartment/unit)"
                required
                className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
              />
            </div>

            {/* Location Selector */}
            <div>
              <LocationSelector
                value={{
                  country: formData.country,
                  countryCode: formData.countryCode || "",
                  state: formData.state,
                  stateCode: formData.stateCode || "",
                  city: formData.city,
                  subArea: formData.subArea || "",
                  zipCode: formData.zip,
                }}
                onChange={handleLocationChange}
                className="mt-1"
              />
            </div>

            {/* Default Address Switch */}
            <div className="flex items-center justify-between p-4 bg-ushop_light_pink/30 border border-ushop-pink/20 rounded-xl">
              <div className="space-y-1">
                <Label htmlFor="default" className="text-sm font-semibold text-ushop-purple-dark">
                  Set as Default Address
                </Label>
                <p className="text-xs text-gray-500">
                  This address will be used as your primary shipping address
                </p>
              </div>
              <Switch
                id="default"
                checked={formData.default}
                onCheckedChange={(checked) =>
                  handleInputChange("default", checked)
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                className="flex-1 bg-ushop-pink hover:bg-ushop-magenta text-white font-semibold shadow-sm transition-all rounded-xl py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditing ? "Updating..." : "Adding..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? "Update" : "Add"} Address</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || deleteLoading}
                className="border-ushop-pink/30 text-ushop-purple-dark hover:bg-ushop_light_pink/50 rounded-xl py-2.5"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Delete Button for Editing */}
            {isEditing && (
              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading || loading}
                  className="w-full rounded-xl py-2.5 font-semibold"
                >
                  {deleteLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Address</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
