"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Plus } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SelectedSkill {
  skillId: string;
  name: string;
  proficiencyLevel: string;
  yearsOfExperience: number;
}

interface SkillsStepProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const PROFICIENCY_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

export function SkillsStep({ data, onUpdate, onNext, onBack, onSkip }: SkillsStepProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(data.skills || []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addingSkill, setAddingSkill] = useState<Skill | null>(null);
  const [newSkillProficiency, setNewSkillProficiency] = useState("INTERMEDIATE");
  const [newSkillYears, setNewSkillYears] = useState("3");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const skills = await response.json();
        setAvailableSkills(skills);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["all", ...new Set(availableSkills.map((s) => s.category))];

  const filteredSkills = availableSkills.filter(
    (skill) =>
      (selectedCategory === "all" || skill.category === selectedCategory) &&
      !selectedSkills.find((s) => s.skillId === skill.id)
  );

  const handleAddSkill = () => {
    if (!addingSkill) return;

    const newSkill: SelectedSkill = {
      skillId: addingSkill.id,
      name: addingSkill.name,
      proficiencyLevel: newSkillProficiency,
      yearsOfExperience: parseInt(newSkillYears),
    };

    setSelectedSkills([...selectedSkills, newSkill]);
    setAddingSkill(null);
    setNewSkillProficiency("INTERMEDIATE");
    setNewSkillYears("3");
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skillId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ skills: selectedSkills });
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Your Skills</h3>
          <div className="space-y-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill.skillId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{skill.name}</span>
                  <Badge variant="secondary">
                    {PROFICIENCY_LEVELS.find((p) => p.value === skill.proficiencyLevel)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? "year" : "years"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSkill(skill.skillId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Skill Form */}
      {addingSkill ? (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Adding: {addingSkill.name}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddingSkill(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proficiency Level</label>
              <Select value={newSkillProficiency} onValueChange={setNewSkillProficiency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Years of Experience</label>
              <Select value={newSkillYears} onValueChange={setNewSkillYears}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} {year === 1 ? "year" : "years"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="button" onClick={handleAddSkill} className="w-full">
            Add Skill
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>

          {/* Skill Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
            {filteredSkills.map((skill) => (
              <Button
                key={skill.id}
                type="button"
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => setAddingSkill(skill)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {skill.name}
              </Button>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {selectedSkills.length > 0
                ? "You've added all available skills in this category"
                : "No skills available in this category"}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button type="submit" disabled={selectedSkills.length === 0}>
            Continue ({selectedSkills.length} selected)
          </Button>
        </div>
      </div>
    </form>
  );
}
