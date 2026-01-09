"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// Import step components
import { BasicInfoStep } from "@/components/onboarding/basic-info-step";
import { ResumeStep } from "@/components/onboarding/resume-step";
import { SkillsStep } from "@/components/onboarding/skills-step";
import { ExperienceStep } from "@/components/onboarding/experience-step";
import { LanguagesStep } from "@/components/onboarding/languages-step";
import { LicensesStep } from "@/components/onboarding/licenses-step";

const STEPS = [
  { id: "basic", title: "Basic Info", description: "Tell us about yourself" },
  { id: "resume", title: "Resume", description: "Upload your resume" },
  { id: "skills", title: "Skills", description: "Select your skills" },
  { id: "experience", title: "Experience", description: "Add work history" },
  { id: "languages", title: "Languages", description: "Languages you speak" },
  { id: "licenses", title: "Licenses", description: "Professional licenses" },
];

export default function WorkerOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Set user type if coming from OAuth
  useEffect(() => {
    const userType = searchParams.get("userType");
    if (userType === "WORKER" && session?.user && !session.user.userType) {
      // Update user type in database
      fetch("/api/user/type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: "WORKER" }),
      }).then(() => {
        update({ userType: "WORKER" });
      });
    }
  }, [searchParams, session, update]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (session?.user?.onboardingCompleted) {
      router.push("/dashboard/worker");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateFormData = (stepData: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/workers/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await update({ onboardingCompleted: true });
        router.push("/dashboard/worker");
      } else {
        console.error("Onboarding failed");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const renderStep = () => {
    const stepProps = {
      data: formData,
      onUpdate: updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
      isFirst: currentStep === 0,
      isLast: currentStep === STEPS.length - 1,
    };

    switch (STEPS[currentStep].id) {
      case "basic":
        return <BasicInfoStep {...stepProps} />;
      case "resume":
        return <ResumeStep {...stepProps} />;
      case "skills":
        return <SkillsStep {...stepProps} />;
      case "experience":
        return <ExperienceStep {...stepProps} />;
      case "languages":
        return <LanguagesStep {...stepProps} />;
      case "licenses":
        return <LicensesStep {...stepProps} onComplete={handleComplete} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Help businesses find you by completing your profile
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="font-medium">{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
