import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  // Redirect logged-in users to their dashboard
  if (session?.user?.onboardingCompleted) {
    if (session.user.userType === "BUSINESS") {
      redirect("/business/dashboard");
    } else {
      redirect("/jobs");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Connect Businesses with
            <span className="block text-primary">Skilled Workers</span>
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            GigIt is a B2B platform that helps businesses hire plumbers, welders, painters,
            and other skilled workers - individually or in bulk.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register/business">Post a Job</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register/worker">Find Work</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose GigIt?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Bulk Hiring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hire multiple skilled workers at once for large projects and save time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Verified Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All workers are verified with certifications and background checks.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="h-8 w-8 text-primary" />
                <CardTitle>Portfolio Showcase</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Workers showcase their past projects and skills to attract businesses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Fast Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our algorithm quickly matches businesses with the right skilled workers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">For Businesses</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Post Jobs Easily</h3>
                    <p className="text-muted-foreground">
                      Create job postings for individual positions or bulk hiring needs.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Review Applications</h3>
                    <p className="text-muted-foreground">
                      Compare worker profiles, portfolios, and ratings side-by-side.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Payments</h3>
                    <p className="text-muted-foreground">
                      Escrow payment system ensures safe transactions for both parties.
                    </p>
                  </div>
                </li>
              </ul>
              <Button asChild>
                <Link href="/register/business">Get Started as a Business</Link>
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Trusted by Leading Companies</CardTitle>
                <CardDescription>
                  Join hundreds of businesses that trust GigIt for their hiring needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average rating</span>
                  <span className="text-2xl font-bold">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jobs posted</span>
                  <span className="text-2xl font-bold">10,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success rate</span>
                  <span className="text-2xl font-bold">95%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Workers Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Card className="order-2 lg:order-1">
              <CardHeader>
                <CardTitle>Build Your Professional Profile</CardTitle>
                <CardDescription>
                  Showcase your skills, certifications, and past work to attract businesses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Create Portfolio</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload photos of your completed projects and certifications.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Set Your Rates</h4>
                  <p className="text-sm text-muted-foreground">
                    Define your hourly, daily, or project-based rates.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Get Hired</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive job offers from verified businesses in your area.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl font-bold">For Workers</h2>
              <p className="text-lg text-muted-foreground">
                Whether you're a plumber, welder, painter, or any skilled tradesperson,
                GigIt connects you with businesses that need your expertise.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <span>Find jobs that match your skills</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <span>Work with verified businesses</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </div>
                  <span>Build your reputation with reviews</span>
                </div>
              </div>
              <Button asChild>
                <Link href="/register/worker">Get Started as a Worker</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg opacity-90">
            Join GigIt today and transform the way you hire or find skilled work.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 GigIt Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
