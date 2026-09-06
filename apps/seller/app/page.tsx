import Link from "next/link";
import { 
  ShoppingBag, 
  TrendingUp, 
  Truck, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  BarChart3, 
  Headphones, 
  ChevronRight,
  Building2,
  Globe,
  Star
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function SellerLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-purple-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── TOP NAV BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                U-Shop
              </span>
              <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Seller Center
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>

            <SignedOut>
              <Link
                href="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/create-store"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                <span>Start Selling</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <span>The Next-Gen Seller Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Reach Millions of Buyers & Grow Your Brand on{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                U-Shop
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Launch your online store in minutes. Manage inventory, process local Mobile Money payments, and ship products directly to campus & nationwide shoppers.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create-store"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white font-semibold text-base shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all"
              >
                <span>Create Your Free Store</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all"
              >
                <span>Access Seller Dashboard</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Upfront Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant MoMo & Bank Payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dedicated Seller Support</span>
              </div>
            </div>
          </div>

          {/* Interactive Mockup Preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 opacity-20 blur-xl" />
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Dashboard Preview Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-slate-400 font-mono">seller.ushopgh.com/dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Metrics
                  </span>
                </div>
              </div>

              {/* Dashboard Mockup Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">GH₵ 48,250.00</div>
                  <span className="text-xs text-emerald-400 font-medium">+24.5% this month</span>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">1,284</div>
                  <span className="text-xs text-purple-400 font-medium">98.2% fulfilled</span>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Active Products</span>
                    <Store className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">64 Items</div>
                  <span className="text-xs text-slate-400">Synced to Sanity CMS</span>
                </div>

                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Store Rating</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">4.9 / 5.0</div>
                  <span className="text-xs text-amber-400 font-medium">Top Rated Seller</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">50,000+</div>
              <div className="text-sm text-slate-400 mt-1">Active Monthly Buyers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400">10+</div>
              <div className="text-sm text-slate-400 mt-1">Universities & Campuses</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-pink-400">GH₵ 2.5M+</div>
              <div className="text-sm text-slate-400 mt-1">Seller Payouts Processed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">24/7</div>
              <div className="text-sm text-slate-400 mt-1">Automated Store Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Why Choose U-Shop</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white">Everything You Need to Scale Your Retail Business</p>
            <p className="text-slate-400">Designed specifically for merchants, campus entrepreneurs, and modern brands looking to reach Ghanaian consumers effortlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Store Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get your own branded storefront with custom banners, store info, inventory highlights, and direct shareable store links.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mobile Money Payments</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Accept MTN MoMo, Telecel Cash, AT Money, and Cards seamlessly. Enjoy direct withdrawal payouts into your account.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Campus & Regional Logistics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Leverage our delivery partners across KNUST, UG Legon, UCC, GCTU, and major regions across Ghana for rapid dispatch.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitor sales performance, best-selling products, customer views, and payout statuses directly from your dashboard.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Store Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Operate single or multiple merchant stores under one account with granular role permissions for your team.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dedicated Merchant Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our seller success team is available 24/7 to help you optimize inventory, resolve customer queries, and boost sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Simple Onboarding</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white">Start Selling in 3 Easy Steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="relative p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-white mb-2">Register Your Account</h3>
              <p className="text-slate-400 text-sm">Sign in with Clerk Auth and complete your merchant store details in under 2 minutes.</p>
            </div>

            <div className="relative p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Products</h3>
              <p className="text-slate-400 text-sm">Add product photos, set prices, and specify categories for automatic indexing on U-Shop.</p>
            </div>

            <div className="relative p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-white mb-2">Receive Orders & Cash Out</h3>
              <p className="text-slate-400 text-sm">Get notified of incoming orders, ship items to buyers, and withdraw earnings instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Got Questions?</h2>
            <p className="text-3xl font-bold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2">How much does it cost to register as a seller?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Opening a store on U-Shop is completely free! We only take a small commission per successful sale, meaning you pay nothing until you make money.</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2">How do I receive payments for my sales?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">All funds from fulfilled orders are credited to your seller wallet. You can initiate instant withdrawals directly to your Mobile Money account (MTN, Telecel, AT) or bank account anytime.</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-2">Can students or small business owners sell on U-Shop?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Yes! U-Shop is built to support students, independent creators, local boutiques, and established brands alike across all major campuses and cities in Ghana.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">U-Shop Seller Platform</span>
            <span>© {new Date().getFullYear()} U-Shop. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://ushopgh.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Main Storefront</span>
            </a>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Seller Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
