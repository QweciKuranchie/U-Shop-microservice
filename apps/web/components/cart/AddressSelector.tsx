"use client";

import React, { useState } from "react";
import {  Button  } from "@repo/ui";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
 } from "@repo/ui";
import {  RadioGroup, RadioGroupItem  } from "@repo/ui";
import {  Label  } from "@repo/ui";
import { MapPin, Plus, List } from "lucide-react";
import { AddAddressSidebar } from "./AddAddressSidebar";
import { AddressSelectorSkeleton } from "./CartSkeleton";
import { AllAddressesSidebar } from "./AllAddressesSidebar";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface AddressSelectorProps {
  userEmail: string;
  addresses: Address[];
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressesRefresh?: () => Promise<void>;
}

export function AddressSelector({
  userEmail,
  addresses,
  selectedAddress,
  onAddressSelect,
  onAddressesRefresh,
}: AddressSelectorProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAllAddressesSidebarOpen, setIsAllAddressesSidebarOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_VISIBLE_ADDRESSES = 3;
  const hasMoreAddresses = addresses.length > MAX_VISIBLE_ADDRESSES;
  const visibleAddresses = addresses.slice(0, MAX_VISIBLE_ADDRESSES);

  const handleAddressAdded = async () => {
    if (onAddressesRefresh) {
      setIsLoading(true);
      await onAddressesRefresh();
      setIsLoading(false);
    }
    setIsSidebarOpen(false);
  };

  if (isLoading) {
    return <AddressSelectorSkeleton />;
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-ushop-pink" />
            Shipping Address
          </CardTitle>
          <CardDescription>Add a shipping address to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-ushop-pink opacity-60" />
            <p className="text-muted-foreground mb-4">No saved addresses yet</p>
            <Button onClick={() => setIsSidebarOpen(true)} className="w-full bg-ushop-purple-dark hover:bg-ushop-purple text-white font-semibold shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </div>

          <AddAddressSidebar
            userEmail={userEmail}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onAddressAdded={handleAddressAdded}
            isFirstAddress={true}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-ushop-pink" />
          Shipping Address
        </CardTitle>
        <CardDescription>
          Select a shipping address for your order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAddress?._id || ""}
          onValueChange={(value) => {
            const address = addresses.find((addr) => addr._id === value);
            if (address) onAddressSelect(address);
          }}
        >
          {visibleAddresses.map((address) => (
            <div key={address._id} className="flex items-start space-x-2">
              <RadioGroupItem
                value={address._id}
                id={address._id}
                className="mt-1 accent-ushop-purple"
              />
              <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    {address.name}
                    {address.default && (
                      <span className="text-xs bg-ushop_light_pink text-ushop-purple-dark border border-ushop-pink/20 font-semibold px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.address}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.city}, {address.state} {address.zip}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {hasMoreAddresses && (
          <Button
            variant="outline"
            className="w-full border-dashed border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors"
            onClick={() => setIsAllAddressesSidebarOpen(true)}
          >
            <List className="w-4 h-4 mr-2" />
            Show All {addresses.length} Addresses
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full border-ushop-pink/40 text-ushop-purple hover:bg-ushop-pink hover:text-white font-semibold transition-colors"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>

        <AddAddressSidebar
          userEmail={userEmail}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddressAdded={handleAddressAdded}
        />

        <AllAddressesSidebar
          isOpen={isAllAddressesSidebarOpen}
          onClose={() => setIsAllAddressesSidebarOpen(false)}
          addresses={addresses}
          selectedAddress={selectedAddress}
          onAddressSelect={onAddressSelect}
        />
      </CardContent>
    </Card>
  );
}
