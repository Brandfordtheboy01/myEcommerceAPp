import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left branded panel */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#1D52F7] to-[#0A1141] lg:flex lg:flex-col lg:justify-between lg:p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#00E676]/10" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#00E676]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00E676]/5" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-xl font-black uppercase tracking-tight text-[#FFFFFF] relative z-10">
          SHOP.CO
        </Link>

        {/* Tagline */}
        <div className="max-w-md space-y-5 relative z-10">
          <h2 className="text-4xl font-black leading-tight text-[#FFFFFF] uppercase tracking-tight">
            Your Multi-Vendor Marketplace
          </h2>
          <p className="text-[#FFFFFF]/80 text-base leading-relaxed">
            Connect with thousands of vendors and discover millions of products across every category in one seamless shopping experience.
          </p>
          {/* Stats row */}
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-2xl font-black text-[#00E676]">5,000+</p>
              <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wider">Active Vendors</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#00E676]">100K+</p>
              <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wider">Products Listed</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#00E676]">50K+</p>
              <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wider">Happy Customers</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#FFFFFF]/40 relative z-10">
          © 2024 Shop.co. All Rights Reserved
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="text-2xl font-black uppercase tracking-tight text-[#1D52F7]">
              SHOP.CO
            </Link>
          </div>

          {/* Title & description */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0A1141]">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
