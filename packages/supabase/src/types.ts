export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SellerType = "personal" | "business" | "student";
export type SellerStatus = "pending_review" | "active" | "suspended" | "rejected";
export type StoreStatus = "pending_review" | "active" | "suspended" | "rejected";
export type KycStatus = "pending" | "submitted" | "approved" | "rejected";
export type KycDocumentType =
  | "national_id_front"
  | "national_id_back"
  | "business_registration"
  | "student_id_front"
  | "student_id_back"
  | "student_proof";

export interface Seller {
  id: string;
  auth_user_id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  seller_type: SellerType;
  status: SellerStatus;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  seller_id: string;
  name: string;
  slug: string;
  owner_name: string;
  description: string | null;
  location: string | null;
  status: StoreStatus;
  sanity_store_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycSubmission {
  id: string;
  seller_id: string;
  seller_type: SellerType;
  status: KycStatus;
  national_id_number: string | null;
  business_name: string | null;
  registration_number: string | null;
  university: string | null;
  student_id_number: string | null;
  student_email: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycDocument {
  id: string;
  kyc_submission_id: string;
  document_type: KycDocumentType;
  storage_path: string;
  imagekit_url: string | null;
  sanity_asset_id: string | null;
  original_filename: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: Seller;
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          seller_type: SellerType;
          status?: SellerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          seller_type?: SellerType;
          status?: SellerStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: Store;
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          slug: string;
          owner_name: string;
          description?: string | null;
          location?: string | null;
          status?: StoreStatus;
          sanity_store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          slug?: string;
          owner_name?: string;
          description?: string | null;
          location?: string | null;
          status?: StoreStatus;
          sanity_store_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kyc_submissions: {
        Row: KycSubmission;
        Insert: {
          id?: string;
          seller_id: string;
          seller_type: SellerType;
          status?: KycStatus;
          national_id_number?: string | null;
          business_name?: string | null;
          registration_number?: string | null;
          university?: string | null;
          student_id_number?: string | null;
          student_email?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          seller_type?: SellerType;
          status?: KycStatus;
          national_id_number?: string | null;
          business_name?: string | null;
          registration_number?: string | null;
          university?: string | null;
          student_id_number?: string | null;
          student_email?: string | null;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kyc_documents: {
        Row: KycDocument;
        Insert: {
          id?: string;
          kyc_submission_id: string;
          document_type: KycDocumentType;
          storage_path: string;
          imagekit_url?: string | null;
          sanity_asset_id?: string | null;
          original_filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          kyc_submission_id?: string;
          document_type?: KycDocumentType;
          storage_path?: string;
          imagekit_url?: string | null;
          sanity_asset_id?: string | null;
          original_filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      seller_type: SellerType;
      seller_status: SellerStatus;
      store_status: StoreStatus;
      kyc_status: KycStatus;
      kyc_document_type: KycDocumentType;
    };
  };
}
