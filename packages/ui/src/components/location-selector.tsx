"use client";

import { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Country, State, City, type ICountry, type IState, type ICity } from "country-state-city";
import { MapPin, Globe } from "lucide-react";

interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  subArea?: string;
  zipCode: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  className?: string;
}

export default function LocationSelector({
  value,
  onChange,
  className,
}: LocationSelectorProps) {
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState<
    ReturnType<typeof State.getStatesOfCountry>
  >([]);
  const [cities, setCities] = useState<
    ReturnType<typeof City.getCitiesOfState>
  >([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load states when country changes
  useEffect(() => {
    let active = true;
    if (value.countryCode) {
      try {
        const countryStates = State.getStatesOfCountry(value.countryCode);
        Promise.resolve().then(() => {
          if (active) {
            setStates(countryStates);
            setLoadingStates(false);
          }
        });
      } catch (error) {
        console.error("Error loading states:", error);
        Promise.resolve().then(() => {
          if (active) {
            setStates([]);
            setLoadingStates(false);
          }
        });
      }
    } else {
      Promise.resolve().then(() => {
        if (active) {
          setStates([]);
          setLoadingStates(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [value.countryCode]);

  // Load cities when state changes
  useEffect(() => {
    let active = true;
    if (value.countryCode && value.stateCode) {
      try {
        const stateCities = City.getCitiesOfState(
          value.countryCode,
          value.stateCode
        );
        Promise.resolve().then(() => {
          if (active) {
            setCities(stateCities);
            setLoadingCities(false);
          }
        });
      } catch (error) {
        console.error("Error loading cities:", error);
        Promise.resolve().then(() => {
          if (active) {
            setCities([]);
            setLoadingCities(false);
          }
        });
      }
    } else {
      Promise.resolve().then(() => {
        if (active) {
          setCities([]);
          setLoadingCities(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [value.countryCode, value.stateCode]);

  const handleCountryChange = (countryCode: string | null) => {
    if (!countryCode) return;
    const country = countries.find((c: ICountry) => c.isoCode === countryCode);
    if (country) {
      onChange({
        country: country.name,
        countryCode: country.isoCode,
        state: "",
        stateCode: "",
        city: "",
        subArea: "",
        zipCode: value.zipCode,
      });
    }
  };

  const handleStateChange = (stateCode: string | null) => {
    if (!stateCode) return;
    const state = states.find((s: IState) => s.isoCode === stateCode);
    if (state) {
      onChange({
        ...value,
        state: state.name,
        stateCode: state.isoCode,
        city: "",
        subArea: "",
      });
    }
  };

  const handleCityChange = (cityName: string | null) => {
    if (!cityName) return;
    onChange({
      ...value,
      city: cityName,
      subArea: "",
    });
  };

  const handleSubAreaChange = (subArea: string) => {
    onChange({
      ...value,
      subArea,
    });
  };

  const handleZipChange = (zipCode: string) => {
    onChange({
      ...value,
      zipCode,
    });
  };

  const resetToCountry = () => {
    onChange({
      country: "",
      countryCode: "",
      state: "",
      stateCode: "",
      city: "",
      subArea: "",
      zipCode: value.zipCode,
    });
  };

  const resetToState = () => {
    onChange({
      ...value,
      state: "",
      stateCode: "",
      city: "",
      subArea: "",
    });
  };

  const resetToCity = () => {
    onChange({
      ...value,
      city: "",
      subArea: "",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="bg-ushop_light_pink/40 rounded-xl p-4 border border-ushop-pink/20">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-ushop-pink" />
          <span className="text-sm font-semibold text-ushop-purple-dark">
            Location Selection
          </span>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {value.country ? (
                <BreadcrumbLink
                  onClick={resetToCountry}
                  className="cursor-pointer hover:text-ushop-pink text-xs font-medium"
                >
                  <Globe className="h-3 w-3 mr-1 inline" />
                  Country
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-ushop-pink font-semibold text-xs">
                  <Globe className="h-3 w-3 mr-1 inline" />
                  Select Country
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {value.country && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {value.state ? (
                    <BreadcrumbLink
                      onClick={resetToState}
                      className="cursor-pointer hover:text-ushop-pink text-xs font-medium"
                    >
                      {value.country}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-ushop-pink font-semibold text-xs">
                      {value.country}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}

            {value.state && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {value.city ? (
                    <BreadcrumbLink
                      onClick={resetToCity}
                      className="cursor-pointer hover:text-ushop-pink text-xs font-medium"
                    >
                      {value.state}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-ushop-pink font-semibold text-xs">
                      {value.state}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}

            {value.city && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-ushop-pink font-semibold text-xs">
                    {value.city}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Country Selection */}
      <div>
        <Label htmlFor="country" className="text-sm font-semibold text-ushop-purple-dark">
          Country *
        </Label>
        <select
          id="country"
          value={value.countryCode}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="mt-1 flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-ushop-pink focus:outline-none focus:ring-2 focus:ring-ushop-pink/20"
        >
          <option value="">Select a country</option>
          {countries.map((country: ICountry) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* State/Province Selection */}
      {value.countryCode && (
        <div>
          <Label htmlFor="state" className="text-sm font-semibold text-ushop-purple-dark">
            {value.country === "United States" ? "State" : "State/Province"} *
          </Label>
          <select
            id="state"
            value={value.stateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={loadingStates || states.length === 0}
            className="mt-1 flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-ushop-pink focus:outline-none focus:ring-2 focus:ring-ushop-pink/20"
          >
            <option value="">
              {loadingStates
                ? "Loading states..."
                : states.length === 0
                ? "No states available"
                : `Select a ${
                    value.country === "United States"
                      ? "state"
                      : "state/province"
                  }`}
            </option>
            {states.map((state: IState) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City Selection */}
      {value.stateCode && (
        <div>
          <Label htmlFor="city" className="text-sm font-semibold text-ushop-purple-dark">
            City *
          </Label>
          <select
            id="city"
            value={value.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={loadingCities || cities.length === 0}
            className="mt-1 flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-ushop-pink focus:outline-none focus:ring-2 focus:ring-ushop-pink/20"
          >
            <option value="">
              {loadingCities
                ? "Loading cities..."
                : cities.length === 0
                ? "No cities available or enter manually below"
                : "Select a city"}
            </option>
            {cities.map((city: ICity) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>

          {/* Manual city input if no cities in database */}
          {value.stateCode && cities.length === 0 && (
            <div className="mt-2">
              <Input
                placeholder="Enter city name manually"
                value={value.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="text-sm rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Sub-area/District (Optional) */}
      {value.city && (
        <div>
          <Label htmlFor="subarea" className="text-sm font-semibold text-ushop-purple-dark">
            Sub-area/District (Optional)
          </Label>
          <Input
            id="subarea"
            placeholder="Enter area, district, or neighborhood"
            value={value.subArea || ""}
            onChange={(e) => handleSubAreaChange(e.target.value)}
            className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
          />
        </div>
      )}

      {/* ZIP/Postal Code */}
      {value.country && (
        <div>
          <Label htmlFor="zipcode" className="text-sm font-semibold text-ushop-purple-dark">
            {value.country === "United States" ? "ZIP Code" : "Postal Code"} *
          </Label>
          <Input
            id="zipcode"
            placeholder={
              value.country === "United States"
                ? "Enter ZIP code (e.g., 12345)"
                : "Enter postal code"
            }
            value={value.zipCode}
            onChange={(e) => handleZipChange(e.target.value)}
            className="mt-1 rounded-xl focus:border-ushop-pink focus:ring-ushop-pink/20"
          />
        </div>
      )}
    </div>
  );
}
