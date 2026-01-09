"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface JobFiltersProps {
  filters: {
    search: string;
    skills: string[];
    jobType: string;
    locationType: string;
    paymentType: string;
    urgency: string;
    city: string;
    state: string;
    minBudget: string;
    maxBudget: string;
    sortBy: string;
  };
  onFilterChange: (filters: any) => void;
  skills: Skill[];
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function JobFilters({ filters, onFilterChange, skills }: JobFiltersProps) {
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 10000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const handleSkillToggle = (skillId: string) => {
    const newSkills = filters.skills.includes(skillId)
      ? filters.skills.filter((id) => id !== skillId)
      : [...filters.skills, skillId];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const handleBudgetChange = (values: number[]) => {
    setBudgetRange(values);
  };

  const handleBudgetCommit = () => {
    onFilterChange({
      ...filters,
      minBudget: budgetRange[0].toString(),
      maxBudget: budgetRange[1].toString(),
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      skills: [],
      jobType: "",
      locationType: "",
      paymentType: "",
      urgency: "",
      city: "",
      state: "",
      minBudget: "",
      maxBudget: "",
      sortBy: "newest",
    });
    setBudgetRange([0, 10000]);
  };

  const activeFilterCount = [
    filters.skills.length > 0,
    filters.jobType,
    filters.locationType,
    filters.paymentType,
    filters.urgency,
    filters.city,
    filters.state,
    filters.minBudget,
    filters.maxBudget,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange({ ...filters, sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="budget_high">Highest Budget</SelectItem>
            <SelectItem value="budget_low">Lowest Budget</SelectItem>
            <SelectItem value="urgency">Most Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label>Job Type</Label>
        <Select
          value={filters.jobType}
          onValueChange={(value) =>
            onFilterChange({ ...filters, jobType: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
            <SelectItem value="BULK">Bulk Hiring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Type */}
      <div className="space-y-2">
        <Label>Work Location</Label>
        <Select
          value={filters.locationType}
          onValueChange={(value) =>
            onFilterChange({ ...filters, locationType: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="ON_SITE">On-site</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Type */}
      <div className="space-y-2">
        <Label>Payment Type</Label>
        <Select
          value={filters.paymentType}
          onValueChange={(value) =>
            onFilterChange({ ...filters, paymentType: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All payment types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HOURLY">Hourly</SelectItem>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="FIXED">Fixed Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <Label>Urgency</Label>
        <Select
          value={filters.urgency}
          onValueChange={(value) =>
            onFilterChange({ ...filters, urgency: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Urgency</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <Label>Location</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="City"
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
          />
          <Select
            value={filters.state}
            onValueChange={(value) =>
              onFilterChange({ ...filters, state: value === "all" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget Range */}
      <div className="space-y-4">
        <Label>Budget Range</Label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={budgetRange}
          onValueChange={handleBudgetChange}
          onValueCommit={handleBudgetCommit}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${budgetRange[0].toLocaleString()}</span>
          <span>${budgetRange[1].toLocaleString()}+</span>
        </div>
      </div>

      {/* Skills */}
      <Accordion type="multiple" defaultValue={Object.keys(skillsByCategory).slice(0, 2)}>
        <Label className="mb-2 block">Skills</Label>
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-sm py-2">
              {category}
              {filters.skills.some((id) =>
                categorySkills.some((s) => s.id === id)
              ) && (
                <Badge variant="secondary" className="ml-2">
                  {
                    filters.skills.filter((id) =>
                      categorySkills.some((s) => s.id === id)
                    ).length
                  }
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill.id}
                      checked={filters.skills.includes(skill.id)}
                      onCheckedChange={() => handleSkillToggle(skill.id)}
                    />
                    <label
                      htmlFor={skill.id}
                      className="text-sm cursor-pointer"
                    >
                      {skill.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Mobile Filter Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <FilterContent />
              </div>
              <div className="p-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
