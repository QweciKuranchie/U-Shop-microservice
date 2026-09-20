-- =====================================================================
-- UShop Seller Center & KYC Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================================

-- 1. Create Sellers table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('personal', 'business', 'student')),
  status TEXT NOT NULL DEFAULT 'pending_review' 
    CHECK (status IN ('pending_review', 'active', 'suspended', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_sellers_auth_user UNIQUE (auth_user_id)
);

-- 2. Create Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'active', 'suspended', 'rejected')),
  sanity_store_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_stores_seller UNIQUE (seller_id)
);

-- 3. Create KYC Submissions table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('personal', 'business', 'student')),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  national_id_number TEXT,
  business_name TEXT,
  registration_number TEXT,
  university TEXT,
  student_id_number TEXT,
  student_email TEXT,
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create KYC Documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_submission_id UUID NOT NULL REFERENCES public.kyc_submissions(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('national_id_front', 'national_id_back', 'business_registration', 'student_id_front', 'student_id_back', 'student_proof')),
  storage_path TEXT NOT NULL,
  imagekit_url TEXT,
  sanity_asset_id TEXT,
  original_filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_sellers_auth_user_id ON public.sellers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_stores_seller_id ON public.stores(seller_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_seller ON public.kyc_submissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_submission ON public.kyc_documents(kyc_submission_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if rerun
DROP POLICY IF EXISTS "Sellers view/edit own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers insert own profile" ON public.sellers;
DROP POLICY IF EXISTS "Sellers view own store" ON public.stores;
DROP POLICY IF EXISTS "Sellers insert own store" ON public.stores;
DROP POLICY IF EXISTS "Sellers update own store" ON public.stores;
DROP POLICY IF EXISTS "Sellers view own kyc submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Sellers insert own kyc submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Sellers view own kyc documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Sellers insert own kyc documents" ON public.kyc_documents;

-- Policies for Sellers
CREATE POLICY "Sellers view/edit own profile" ON public.sellers
  FOR ALL TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Sellers insert own profile" ON public.sellers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Policies for Stores
CREATE POLICY "Sellers view own store" ON public.stores
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Sellers insert own store" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Sellers update own store" ON public.stores
  FOR UPDATE TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()))
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()));

-- Policies for KYC Submissions
CREATE POLICY "Sellers view own kyc submissions" ON public.kyc_submissions
  FOR SELECT TO authenticated
  USING (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Sellers insert own kyc submissions" ON public.kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE auth_user_id = auth.uid()));

-- Policies for KYC Documents
CREATE POLICY "Sellers view own kyc documents" ON public.kyc_documents
  FOR SELECT TO authenticated
  USING (kyc_submission_id IN (
    SELECT ks.id FROM public.kyc_submissions ks
    JOIN public.sellers s ON ks.seller_id = s.id
    WHERE s.auth_user_id = auth.uid()
  ));

CREATE POLICY "Sellers insert own kyc documents" ON public.kyc_documents
  FOR INSERT TO authenticated
  WITH CHECK (kyc_submission_id IN (
    SELECT ks.id FROM public.kyc_submissions ks
    JOIN public.sellers s ON ks.seller_id = s.id
    WHERE s.auth_user_id = auth.uid()
  ));

-- =====================================================================
-- Storage Bucket for KYC Documents (Private)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Sellers can upload KYC docs" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can read own KYC docs" ON storage.objects;

CREATE POLICY "Sellers can upload KYC docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Sellers can read own KYC docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
