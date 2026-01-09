"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, HardHat } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary">
            GigIt
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to use GigIt
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Worker Card */}
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <Link href="/register/worker">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <HardHat className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>I&apos;m a Skilled Worker</CardTitle>
                <CardDescription>
                  Find jobs and showcase your skills
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>Create your professional profile</li>
                  <li>Showcase your portfolio</li>
                  <li>Apply for individual or bulk jobs</li>
                  <li>Get paid securely</li>
                </ul>
                <Button className="w-full">Sign Up as Worker</Button>
              </CardContent>
            </Link>
          </Card>

          {/* Business Card */}
          <Card className="hover:border-primary transition-colors cursor-pointer group">
            <Link href="/register/business">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>I&apos;m a Business</CardTitle>
                <CardDescription>
                  Hire skilled workers for your projects
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>Post jobs instantly</li>
                  <li>Hire individually or in bulk</li>
                  <li>Access verified professionals</li>
                  <li>Secure payment processing</li>
                </ul>
                <Button className="w-full">Sign Up as Business</Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
