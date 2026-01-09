"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";

interface Language {
  id: string;
  name: string;
  code: string;
}

interface SelectedLanguage {
  languageId: string;
  name: string;
  proficiency: string;
}

interface LanguagesStepProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const PROFICIENCY_LEVELS = [
  { value: "BASIC", label: "Basic", description: "Can understand simple phrases" },
  { value: "CONVERSATIONAL", label: "Conversational", description: "Can hold basic conversations" },
  { value: "FLUENT", label: "Fluent", description: "Can communicate effectively" },
  { value: "NATIVE", label: "Native", description: "Native speaker" },
];

const COMMON_LANGUAGES = [
  { id: "en", name: "English", code: "en" },
  { id: "es", name: "Spanish", code: "es" },
  { id: "fr", name: "French", code: "fr" },
  { id: "de", name: "German", code: "de" },
  { id: "zh", name: "Chinese (Mandarin)", code: "zh" },
  { id: "pt", name: "Portuguese", code: "pt" },
  { id: "ar", name: "Arabic", code: "ar" },
  { id: "hi", name: "Hindi", code: "hi" },
  { id: "ru", name: "Russian", code: "ru" },
  { id: "ja", name: "Japanese", code: "ja" },
  { id: "ko", name: "Korean", code: "ko" },
  { id: "it", name: "Italian", code: "it" },
  { id: "vi", name: "Vietnamese", code: "vi" },
  { id: "pl", name: "Polish", code: "pl" },
  { id: "tl", name: "Tagalog", code: "tl" },
];

export function LanguagesStep({ data, onUpdate, onNext, onBack, onSkip }: LanguagesStepProps) {
  const [availableLanguages] = useState<Language[]>(COMMON_LANGUAGES);
  const [selectedLanguages, setSelectedLanguages] = useState<SelectedLanguage[]>(data.languages || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newLanguageId, setNewLanguageId] = useState("");
  const [newProficiency, setNewProficiency] = useState("CONVERSATIONAL");

  const unselectedLanguages = availableLanguages.filter(
    (lang) => !selectedLanguages.find((s) => s.languageId === lang.id)
  );

  const handleAddLanguage = () => {
    if (!newLanguageId) return;

    const language = availableLanguages.find((l) => l.id === newLanguageId);
    if (!language) return;

    const newLang: SelectedLanguage = {
      languageId: language.id,
      name: language.name,
      proficiency: newProficiency,
    };

    setSelectedLanguages([...selectedLanguages, newLang]);
    setNewLanguageId("");
    setNewProficiency("CONVERSATIONAL");
    setIsAdding(false);
  };

  const handleRemoveLanguage = (languageId: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l.languageId !== languageId));
  };

  const handleUpdateProficiency = (languageId: string, proficiency: string) => {
    setSelectedLanguages(
      selectedLanguages.map((lang) =>
        lang.languageId === languageId ? { ...lang, proficiency } : lang
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ languages: selectedLanguages });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Your Languages</h3>
          <div className="space-y-2">
            {selectedLanguages.map((lang) => (
              <div
                key={lang.languageId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{lang.name}</span>
                  <Select
                    value={lang.proficiency}
                    onValueChange={(value) => handleUpdateProficiency(lang.languageId, value)}
                  >
                    <SelectTrigger className="w-40 h-8">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLanguage(lang.languageId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Language Form */}
      {isAdding ? (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Add Language</h4>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={newLanguageId} onValueChange={setNewLanguageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {unselectedLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proficiency Level</label>
              <div className="grid grid-cols-2 gap-2">
                {PROFICIENCY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={newProficiency === level.value ? "default" : "outline"}
                    className="flex flex-col h-auto py-3 px-4"
                    onClick={() => setNewProficiency(level.value)}
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs font-normal opacity-70">{level.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddLanguage}
            className="w-full"
            disabled={!newLanguageId}
          >
            Add Language
          </Button>
        </div>
      ) : unselectedLanguages.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      ) : (
        <p className="text-center text-muted-foreground">
          You&apos;ve added all available languages
        </p>
      )}

      {/* Quick Add Common Languages */}
      {!isAdding && unselectedLanguages.length > 0 && selectedLanguages.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick add common languages:</p>
          <div className="flex flex-wrap gap-2">
            {unselectedLanguages.slice(0, 6).map((lang) => (
              <Badge
                key={lang.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setSelectedLanguages([
                    ...selectedLanguages,
                    { languageId: lang.id, name: lang.name, proficiency: "CONVERSATIONAL" },
                  ]);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                {lang.name}
              </Badge>
            ))}
          </div>
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
          <Button type="submit">Continue</Button>
        </div>
      </div>
    </form>
  );
}
