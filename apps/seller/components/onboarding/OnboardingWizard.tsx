"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Building2,
  GraduationCap,
  Store,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Shield,
  Loader2,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Button, Input, Label, Textarea } from "@repo/ui";
import { createStoreAction } from "@/app/(onboarding)/create-store/actions";
import type { SellerType } from "@repo/supabase/types";

interface UserProfileDefaults {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  sellerType?: SellerType;
}

export function OnboardingWizard({ initialProfile }: { initialProfile?: UserProfileDefaults }) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [sellerType, setSellerType] = useState<SellerType>(initialProfile?.sellerType || "personal");

  // Step 2: Store Details
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState(
    initialProfile?.firstName && initialProfile?.lastName
      ? `${initialProfile.firstName} ${initialProfile.lastName}`
      : ""
  );
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Step 3: KYC Details
  // Personal
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [nationalIdFront, setNationalIdFront] = useState<File | null>(null);
  const [nationalIdBack, setNationalIdBack] = useState<File | null>(null);

  // Business
  const [businessName, setBusinessName] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);

  // Student
  const [university, setUniversity] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentIdDoc, setStudentIdDoc] = useState<File | null>(null);

  // Step 4: Agreement
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 1 Validation
  const validateStep1 = () => {
    return !!sellerType;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!storeName.trim() || !ownerName.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in all required store details.");
      return false;
    }
    setError(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    setError(null);
    if (sellerType === "personal") {
      if (!nationalIdNumber.trim()) {
        setError("Ghana Card / National ID number is required.");
        return false;
      }
      if (!nationalIdFront) {
        setError("Please upload the front photo of your National ID.");
        return false;
      }
    } else if (sellerType === "business") {
      if (!businessName.trim() || !businessRegNumber.trim()) {
        setError("Registered business name and registration number are required.");
        return false;
      }
      if (!businessDoc) {
        setError("Please upload your Business Registration Certificate.");
        return false;
      }
    } else if (sellerType === "student") {
      if (!university.trim() || !studentIdNumber.trim() || !studentEmail.trim()) {
        setError("University name, student ID number, and student email are required.");
        return false;
      }
      if (!studentIdDoc) {
        setError("Please upload a photo of your Student ID card.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please certify that all submitted documents and information are genuine.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("sellerType", sellerType);
      formData.set("name", storeName.trim());
      formData.set("ownerName", ownerName.trim());
      formData.set("phone", phone.trim());
      formData.set("email", email.trim());
      formData.set("location", location.trim());
      formData.set("description", description.trim());

      if (sellerType === "personal") {
        formData.set("nationalIdNumber", nationalIdNumber.trim());
        if (nationalIdFront) formData.set("nationalIdFront", nationalIdFront);
        if (nationalIdBack) formData.set("nationalIdBack", nationalIdBack);
      } else if (sellerType === "business") {
        formData.set("businessName", businessName.trim());
        formData.set("businessRegistrationNumber", businessRegNumber.trim());
        if (businessDoc) formData.set("businessDoc", businessDoc);
      } else if (sellerType === "student") {
        formData.set("university", university.trim());
        formData.set("studentIdNumber", studentIdNumber.trim());
        formData.set("studentEmail", studentEmail.trim());
        if (studentIdDoc) formData.set("studentIdDoc", studentIdDoc);
      }

      await createStoreAction(formData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
        setError(err.message || "Failed to submit onboarding application.");
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-10 backdrop-blur-xl text-slate-100">
      {/* Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
              Step {step} of 4
            </span>
            <span className="text-sm font-medium text-slate-400">
              {step === 1 && "Select Seller Category"}
              {step === 2 && "Store & Contact Information"}
              {step === 3 && "KYC Document Verification"}
              {step === 4 && "Review & Submit Application"}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{step * 25}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELLER TYPE */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">What type of seller are you?</h2>
            <p className="text-sm text-slate-400 mt-1">
              Select the account type that best matches how you will operate your UShop store.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Personal Card */}
            <div
              onClick={() => setSellerType("personal")}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                sellerType === "personal"
                  ? "bg-purple-600/15 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/20"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  sellerType === "personal" ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-base">Personal Seller</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Ghana Card KYC
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Best for individual entrepreneurs, tech enthusiasts, and independent gadget sellers selling personal inventory or devices.
                </p>
              </div>
            </div>

            {/* Business Card */}
            <div
              onClick={() => setSellerType("business")}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                sellerType === "business"
                  ? "bg-purple-600/15 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/20"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  sellerType === "business" ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-base">Verified Business</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Business Reg (RGD)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For registered shops, retailers, importers, and tech brands. Display a Verified Merchant badge on product listings.
                </p>
              </div>
            </div>

            {/* Student Card */}
            <div
              onClick={() => setSellerType("student")}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                sellerType === "student"
                  ? "bg-purple-600/15 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/20"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  sellerType === "student" ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-base">Campus Student Seller</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Student ID Badge
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For university and college students selling on campus. Connect with peer student buyers across Legon, KNUST, UCC, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: STORE DETAILS */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Store Information</h2>
            <p className="text-sm text-slate-400 mt-1">
              Give your storefront a brand name and provide contact details for buyer inquiries and order notifications.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-xs font-medium text-slate-300">
                Store Name *
              </Label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <Input
                  id="storeName"
                  placeholder="e.g. Accra Gadget Hub"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ownerName" className="text-xs font-medium text-slate-300">
                Merchant / Owner Name *
              </Label>
              <Input
                id="ownerName"
                placeholder="e.g. Kwame Mensah"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-slate-300">
                  Phone (WhatsApp) *
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <Input
                    id="phone"
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Store Email *
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="store@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-medium text-slate-300">
                Operating City / Campus Location
              </Label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <Input
                  id="location"
                  placeholder="e.g. Circle Tip-Toe Lane, Accra or UG Legon Campus"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-slate-300">
                Brief Store Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your tech products, warranty terms, or pickup points..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 text-sm rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: KYC DOCUMENTS (DYNAMIC PER SELLER TYPE) */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">KYC Verification Documents</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {sellerType === "personal" && "Upload your valid Ghana Card for individual identity verification."}
              {sellerType === "business" && "Provide your company registration details and official business certificate."}
              {sellerType === "student" && "Provide your university credentials and student identification badge."}
            </p>
          </div>

          {/* Personal KYC */}
          {sellerType === "personal" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="nationalIdNumber" className="text-xs font-medium text-slate-300">
                  Ghana Card / National ID Number (e.g. GHA-000000000-0) *
                </Label>
                <Input
                  id="nationalIdNumber"
                  placeholder="GHA-123456789-0"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  required
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Front of ID Card *
                  </Label>
                  <label className="border border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-purple-500/5 transition-all text-center min-h-[110px]">
                    <Upload className="w-5 h-5 text-purple-400 mb-2" />
                    <span className="text-xs text-slate-300 font-medium">
                      {nationalIdFront ? nationalIdFront.name : "Upload Front Image"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or PDF (max 10MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setNationalIdFront(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Back of ID Card (Optional)
                  </Label>
                  <label className="border border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-purple-500/5 transition-all text-center min-h-[110px]">
                    <Upload className="w-5 h-5 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-300 font-medium">
                      {nationalIdBack ? nationalIdBack.name : "Upload Back Image"}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or PDF (max 10MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setNationalIdBack(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Business KYC */}
          {sellerType === "business" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-xs font-medium text-slate-300">
                  Registered Business Name *
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Accra Tech Solutions Ltd."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="businessRegNumber" className="text-xs font-medium text-slate-300">
                  Business Registration Number (RGD) *
                </Label>
                <Input
                  id="businessRegNumber"
                  placeholder="e.g. CS000002023"
                  value={businessRegNumber}
                  onChange={(e) => setBusinessRegNumber(e.target.value)}
                  required
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Business Registration Certificate Document *
                </Label>
                <label className="border border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-purple-500/5 transition-all text-center min-h-[120px]">
                  <FileText className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-xs text-slate-200 font-semibold">
                    {businessDoc ? businessDoc.name : "Click to select Registration Certificate"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">PDF or image of Form 3/RGD Certificate</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setBusinessDoc(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Student KYC */}
          {sellerType === "student" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="university" className="text-xs font-medium text-slate-300">
                  University / Tertiary Institution *
                </Label>
                <Input
                  id="university"
                  placeholder="e.g. University of Ghana, Legon or KNUST"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="studentIdNumber" className="text-xs font-medium text-slate-300">
                    Student ID Number *
                  </Label>
                  <Input
                    id="studentIdNumber"
                    placeholder="e.g. 10928374"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    required
                    className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentEmail" className="text-xs font-medium text-slate-300">
                    Institutional Email (.edu / .ac.gh) *
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="student@st.ug.edu.gh"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 h-10 text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Photo of Student ID Card *
                </Label>
                <label className="border border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 hover:bg-purple-500/5 transition-all text-center min-h-[120px]">
                  <Upload className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-xs text-slate-200 font-semibold">
                    {studentIdDoc ? studentIdDoc.name : "Upload Student ID Card"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Clear photo of valid student ID card</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setStudentIdDoc(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-white">Review Your Application</h2>
            <p className="text-sm text-slate-400 mt-1">
              Please verify your information before submitting for compliance verification.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Seller Category:</span>
              <span className="font-semibold text-purple-400 capitalize flex items-center gap-1.5">
                {sellerType === "personal" && <UserCheck className="w-3.5 h-3.5" />}
                {sellerType === "business" && <Building2 className="w-3.5 h-3.5" />}
                {sellerType === "student" && <GraduationCap className="w-3.5 h-3.5" />}
                {sellerType} Seller
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Store Name:</span>
              <span className="font-medium text-white">{storeName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Owner Name:</span>
              <span className="font-medium text-white">{ownerName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Contact Phone:</span>
              <span className="font-medium text-white">{phone}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Store Email:</span>
              <span className="font-medium text-white">{email}</span>
            </div>

            {location && (
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-white">{location}</span>
              </div>
            )}

            {/* KYC Doc details */}
            {sellerType === "personal" && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">National ID:</span>
                <span className="font-mono text-purple-300">{nationalIdNumber}</span>
              </div>
            )}

            {sellerType === "business" && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-slate-400">Registered Business:</span>
                  <span className="font-medium text-white">{businessName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reg. Number:</span>
                  <span className="font-mono text-purple-300">{businessRegNumber}</span>
                </div>
              </>
            )}

            {sellerType === "student" && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-slate-400">Institution:</span>
                  <span className="font-medium text-white">{university}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Student ID / Email:</span>
                  <span className="font-mono text-purple-300">{studentIdNumber} ({studentEmail})</span>
                </div>
              </>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              I certify that all details and identification documents submitted are authentic and belong to me or my registered business. I agree to UShop's Seller Code of Conduct.
            </span>
          </label>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-slate-800/60">
        {step > 1 ? (
          <Button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            variant="outline"
            className="h-11 px-5 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="h-11 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !agreeTerms}
            className="h-11 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-purple-600/25 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                Submit for Verification
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
