import Link from "next/link";
import { Store } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden w-1/2 gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-5" />
          </div>
          Marketplace
        </Link>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Shop from trusted vendors, all in one place
          </h2>
          <p className="text-muted-foreground">
            Discover unique products, secure checkout, and seamless order tracking across our multi-vendor marketplace.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Trusted by vendors and shoppers nationwide
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              Marketplace
            </Link>
          </div>
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
