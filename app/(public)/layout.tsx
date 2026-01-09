import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={
          session?.user
            ? {
                id: session.user.id,
                name: session.user.name ?? null,
                email: session.user.email ?? null,
                image: session.user.image ?? null,
                userType: session.user.userType ?? null,
              }
            : null
        }
      />
      <main>{children}</main>
    </div>
  );
}
