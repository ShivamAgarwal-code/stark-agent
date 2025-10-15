import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { StarknetProvider } from "@/lib/StarknetProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <div vaul-drawer-wrapper="" className="bg-background">
        <StarknetProvider>
          <SidebarProvider>
            <AppSidebar />
            <Component {...pageProps} />
          </SidebarProvider>
        </StarknetProvider>
      </div>
    </>
  );
}
