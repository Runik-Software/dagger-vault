"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ShimmerProvider } from "@shimmer-from-structure/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <ShimmerProvider
      config={{
        shimmerColor: "oklch(50.563% 0.12078 49.268)",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthUIProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          onSessionChange={() => {
            // Clear router cache (protected routes)
            router.refresh();
          }}
          Link={Link}
          social={{ providers: ["google"] }}
        >
          {children}
        </AuthUIProvider>
      </QueryClientProvider>
    </ShimmerProvider>
  );
}
