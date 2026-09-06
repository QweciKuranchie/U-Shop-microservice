"use client";

import React, { useState, useTransition } from "react";
import {  Button  } from "@repo/ui";
import {  Input  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import {  Switch  } from "@repo/ui";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
 } from "@repo/ui";
import { LocationSelector } from "@repo/ui";
import { MapPin, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  subArea?: string;
  zipCode: string;
}

interface AddAddressSidebarProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onAddressAdded?: () => Promise<void>;
  isFirstAddress?: boolean;
}

export function AddAddressSidebar({
  userEmail,
  isOpen,
  onClose,
  onAddressAdded,
  isFirstAddress = false,
}: AddAddressSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    countryCode: "",
    stateCode: "",
    subArea: "",
    phone: "",
    type: "home" as "home" | "office" | "other" | "work" | "school",
    isDefault: isFirstAddress,
  });

  const handleLocationChange = (location: LocationData) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.country
    ) {
      toast.error("Please fill in all required fields including location details");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/user/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            countryCode: formData.countryCode,
            stateCode: formData.stateCode,
            subArea: formData.subArea,
            phone: formData.phone,
            type: formData.type,
            default: formData.isDefault,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create address");
        }

        toast.success("Address saved successfully!");
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          countryCode: "",
          stateCode: "",
          subArea: "",
          phone: "",
          type: "home",
          isDefault: false,
        });
        onClose();

        if (onAddressAdded) {
          await onAddressAdded();
        } else {
          window.location.reload();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add address"
        );
        console.error("Address creation error:", error);
      }
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-l border-ushop-pink/20">
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-ushop-pink/15">
          <SheetTitle className="flex items-center gap-2 text-ushop-purple-dark font-bold text-xl">
            <MapPin className="w-5 h-5 text-ushop-pink" />
            {isFirstAddress ? "Add Your First Address" : "Add New Address"}
          </SheetTitle>
          <SheetDescription className="text-gray-500 text-sm">
            Add a shipping address for {userEmail}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Address Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-semibold text-ushop-purple-dark">
              Address Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., Home, Office, Mom's House"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isPending}
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
              placeholder="e.g., (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isPending}
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
              disabled={isPending}
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
              placeholder="Enter your street address (house number, street name, unit)"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={isPending}
              required
              className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
            />
          </div>

          {/* Location Selector */}
          <div>
            <LocationSelector
              value={{
                country: formData.country,
                countryCode: formData.countryCode,
                state: formData.state,
                stateCode: formData.stateCode,
                city: formData.city,
                subArea: formData.subArea,
                zipCode: formData.zip,
              }}
              onChange={handleLocationChange}
              className="mt-1"
            />
          </div>

          {/* Default Address Switch */}
          <div className="flex items-center justify-between p-4 bg-ushop_light_pink/30 border border-ushop-pink/20 rounded-xl">
            <div className="space-y-1">
              <Label htmlFor="isDefault" className="text-sm font-semibold text-ushop-purple-dark">
                Set as Default Address
              </Label>
              <p className="text-xs text-gray-500">
                {isFirstAddress
                  ? "First address is default automatically"
                  : "Use as primary shipping address"}
              </p>
            </div>
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                handleInputChange("isDefault", checked)
              }
              disabled={isPending || isFirstAddress}
            />
          </div>

          {/* Footer Actions */}
          <SheetFooter className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isPending}
              className="flex-1 border-ushop-pink/30 text-ushop-purple-dark hover:bg-ushop_light_pink/50 rounded-xl py-2.5"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-ushop-pink hover:bg-ushop-magenta text-white font-semibold shadow-sm transition-all rounded-xl py-2.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Address
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
