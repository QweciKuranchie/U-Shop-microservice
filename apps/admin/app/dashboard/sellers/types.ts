export interface AdminStoreSeller {
  _id: string;
  name: string;
  slug: string;
  ownerName: string;
  phone?: string;
  email?: string;
  sellerType?: "personal" | "business" | "student";
  status?: "active" | "pending_review" | "suspended" | "rejected";
  kycStatus?: "pending_review" | "approved" | "rejected";
  kycRejectionReason?: string;
  kycReviewedAt?: string;
  kycReviewedBy?: string;
  nationalIdNumber?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  university?: string;
  studentIdNumber?: string;
  studentEmail?: string;
  verifiedSeller?: boolean;
  verifiedStudent?: boolean;
  location?: string;
  description?: string;
  _createdAt: string;
}
