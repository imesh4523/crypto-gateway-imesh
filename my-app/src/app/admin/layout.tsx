import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Soltio | Admin Central",
    description: "Global system administration and oversight",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
