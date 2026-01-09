import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, Users, Shield, Zap, Search, MapPin, ArrowRight, CheckCircle2, Twitter, Facebook, Instagram, Linkedin, Hammer, HardHat, Wallet } from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/ui/count-up";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default async function Home() {
  const session = await auth();

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
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_25%)] opacity-10" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
            <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full border-primary/20 text-primary bg-primary/5">
              The #1 Network for Skilled Trades
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground min-h-[3.6em] md:min-h-[3em]">
              Find Work as a <br className="md:hidden" />
              <span className="text-primary block md:inline mt-2 md:mt-0">
                <TypewriterEffect 
                  words={["Plumber", "Electrician", "Welder", "Carpenter", "Painter"]} 
                />
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Take control of your career. Set your rates, build your portfolio, and connect directly with businesses looking for your expertise.
            </p>

            {/* Worker-First Search Bar */}
            <div className="w-full max-w-2xl mt-8">
              <form action="/jobs" className="flex flex-col md:flex-row gap-3 p-2 bg-background/80 backdrop-blur-md border rounded-2xl shadow-xl shadow-primary/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    name="q"
                    placeholder="What's your trade?" 
                    className="pl-10 h-12 border-transparent bg-transparent focus-visible:ring-0 text-base rounded-xl"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-border my-auto" />
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    name="location"
                    placeholder="Where do you want to work?" 
                    className="pl-10 h-12 border-transparent bg-transparent focus-visible:ring-0 text-base rounded-xl"
                  />
                </div>
                <Button size="lg" type="submit" className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-primary/25">
                  Find Jobs
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                <span>Trending Jobs:</span>
                {['Commercial Plumbing', 'Industrial Welding', 'Electrical Wiring', 'Drywall'].map((job) => (
                  <Link key={job} href={`/jobs?q=${job}`} className="hover:text-primary underline decoration-dotted underline-offset-4">
                    {job}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">
                <CountUp end={10000} suffix="+" />
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Pros</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">
                <CountUp end={5000} suffix="+" />
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Jobs Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">
                <CountUp end={45} prefix="$" />
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Hourly Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-foreground">
                <CountUp end={24} suffix="h" />
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Time to Hire</div>
            </div>
          </div>
        </div>
      </section>

      {/* Worker Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Built for the Modern Tradesperson</h2>
              <p className="text-muted-foreground text-lg">
                Stop chasing payments and cold calling. GigIt brings the work to you with tools to manage your career.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/register/worker">Join the Network</Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: "Secure Payments", desc: "Never worry about getting stiffed. Our escrow system ensures you get paid for every job." },
              { icon: HardHat, title: "Consistent Work", desc: "Access a steady stream of projects from verified businesses and contractors." },
              { icon: Briefcase, title: "Build Your Brand", desc: "Showcase your certifications and past projects to attract higher-paying clients." },
              { icon: Hammer, title: "Total Control", desc: "Set your own schedule and rates. You decide when and where you want to work." },
            ].map((feature, i) => (
              <Card key={i} className="group border shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/50 bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Audience Section - Worker Focused Layout */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
             {/* Worker Card (Now First and Highlighted) */}
             <div className="rounded-[2rem] bg-primary text-primary-foreground p-8 md:p-12 shadow-lg shadow-primary/20 order-1">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium mb-6 text-white border border-white/20">
                For Skilled Workers
              </div>
              <h3 className="text-3xl font-bold mb-4">Upgrade Your Career</h3>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Join thousands of pros using GigIt to earn more and work less on admin.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Free profile and portfolio hosting",
                  "Direct access to top construction firms",
                  "Weekly payouts and automated invoicing"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground shrink-0" />
                    <span className="text-primary-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="secondary" className="rounded-full w-full sm:w-auto bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/register/worker">Get Started Free</Link>
              </Button>
            </div>

            {/* Business Card (Now Second) */}
            <div className="rounded-[2rem] bg-background border p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow order-2">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                For Businesses
              </div>
              <h3 className="text-3xl font-bold mb-4">Need to Hire?</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Find the right talent for your projects, from quick fixes to major constructions.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Post jobs for free and view applicants",
                  "Review verified credentials and ratings",
                  "Manage your entire workforce in one dashboard"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto border-primary/20 hover:bg-primary/5 text-primary" asChild>
                <Link href="/register/business">Post a Job</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-muted text-muted-foreground pt-16 pb-8 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">GigIt</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                Empowering the trades. We connect skilled professionals with the businesses that need them most.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">For Workers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
                <li><Link href="/register/worker" className="hover:text-primary transition-colors">Create Profile</Link></li>
                <li><Link href="/resources/salary-guide" className="hover:text-primary transition-colors">Salary Guide</Link></li>
                <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">For Business</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register/business" className="hover:text-primary transition-colors">Post a Job</Link></li>
                <li><Link href="/workers" className="hover:text-primary transition-colors">Find Workers</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/enterprise" className="hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} GigIt Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Built for the future of work.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}