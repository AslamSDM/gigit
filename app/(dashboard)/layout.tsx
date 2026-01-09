import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if onboarding is completed
  if (!session.user.onboardingCompleted) {
    if (session.user.userType === "BUSINESS") {
      redirect("/onboarding/business");
    } else {
      redirect("/onboarding/worker");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
          userType: session.user.userType ?? null,
        }}
      />
      <main>{children}</main>
    </div>
  );
}
