"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  LanguageType, PresentationConfig, ToneType, VerbosityType } from "../type";
import { useState } from "react";
import { Check, ChevronsUpDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ToolTip from "@/components/ToolTip";
import { useTranslation } from "@/app/hooks/useTranslation";
import { getToneTranslationKey, getVerbosityTranslationKey } from "@/utils/translations";

// Types
interface ConfigurationSelectsProps {
  config: PresentationConfig;
  onConfigChange: (key: keyof PresentationConfig, value: any) => void;
}

type SlideOption = "5" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20";

// Constants
const SLIDE_OPTIONS: SlideOption[] = ["5", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

/**
 * Renders a select component for slide count
 */
const SlideCountSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
}> = ({ value, onValueChange }) => {
  const { t } = useTranslation();
  const [customInput, setCustomInput] = useState(
    value && !SLIDE_OPTIONS.includes(value as SlideOption) ? value : ""
  );

  const sanitizeToPositiveInteger = (raw: string): string => {
    const digitsOnly = raw.replace(/\D+/g, "");
    if (!digitsOnly) return "";
    // Remove leading zeros
    const noLeadingZeros = digitsOnly.replace(/^0+/, "");
    return noLeadingZeros;
  };

  const applyCustomValue = () => {
    const sanitized = sanitizeToPositiveInteger(customInput);
    if (sanitized && Number(sanitized) > 0) {
      onValueChange(sanitized);
    }
  };

  return (
    <Select value={value || ""} onValueChange={onValueChange} name="slides">
      <SelectTrigger
        className="w-[180px] font-instrument_sans font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300"
        data-testid="slides-select"
      >
        <SelectValue placeholder={t('slides.selectSlides')} />
      </SelectTrigger>
      <SelectContent className="font-instrument_sans">
        {/* Sticky custom input at the top */}
        <div
          className="sticky top-0 z-10 bg-white  p-2 border-b"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              value={customInput}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const next = sanitizeToPositiveInteger(e.target.value);
                setCustomInput(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCustomValue();
                }
              }}
              onBlur={applyCustomValue}
              placeholder="--"
              className="h-8 w-16 px-2 text-sm"
            />
            <span className="text-sm font-medium">{t('slides.slides')}</span>
          </div>
        </div>

        {/* Hidden item to allow SelectValue to render custom selection */}
        {value && !SLIDE_OPTIONS.includes(value as SlideOption) && (
          <SelectItem value={value} className="hidden">
            {value} {t('slides.slides')}
          </SelectItem>
        )}

        {SLIDE_OPTIONS.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="font-instrument_sans text-sm font-medium"
            role="option"
          >
            {option} {t('slides.slides')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

/**
 * Renders a language selection component with search functionality
 */
const LanguageSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ value, onValueChange, open, onOpenChange }) => {
  const { t } = useTranslation();
  return (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        name="language"
        data-testid="language-select"
        aria-expanded={open}
        className="w-[200px] justify-between font-instrument_sans font-semibold overflow-hidden bg-blue-100 hover:bg-blue-100 border-blue-200 focus-visible:ring-blue-300 border-none"
      >
        <p className="text-sm font-medium truncate">
          {value || t('language.selectLanguage2')}
        </p>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[300px] p-0" align="end">
      <Command>
        <CommandInput
          placeholder={t('language.searchLanguage')}
          className="font-instrument_sans"
        />
        <CommandList>
          <CommandEmpty>{t('language.noLanguageFound')}</CommandEmpty>
          <CommandGroup>
            {Object.values(LanguageType).map((language) => (
              <CommandItem
                key={language}
                value={language}
                role="option"
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  onOpenChange(false);
                }}
                className="font-instrument_sans"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language ? "opacity-100" : "opacity-0"
                  )}
                />
                {language}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);
};

export function ConfigurationSelects({
  config,
  onConfigChange,
}: ConfigurationSelectsProps) {
  const { t } = useTranslation();
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openAdvanced, setOpenAdvanced] = useState(false);

  const [advancedDraft, setAdvancedDraft] = useState({
    tone: config.tone,
    verbosity: config.verbosity,
    instructions: config.instructions,
    includeTableOfContents: config.includeTableOfContents,
    includeTitleSlide: config.includeTitleSlide,
    webSearch: config.webSearch,
  });

  const handleOpenAdvancedChange = (open: boolean) => {
    if (open) {
      setAdvancedDraft({
        tone: config.tone,
        verbosity: config.verbosity,
        instructions: config.instructions,
        includeTableOfContents: config.includeTableOfContents,
        includeTitleSlide: config.includeTitleSlide,
        webSearch: config.webSearch,
      });
    }
    setOpenAdvanced(open);
  };

  const handleSaveAdvanced = () => {
    onConfigChange("tone", advancedDraft.tone);
    onConfigChange("verbosity", advancedDraft.verbosity);
    onConfigChange("instructions", advancedDraft.instructions);
    onConfigChange("includeTableOfContents", advancedDraft.includeTableOfContents);
    onConfigChange("includeTitleSlide", advancedDraft.includeTitleSlide);
    onConfigChange("webSearch", advancedDraft.webSearch);
    setOpenAdvanced(false);
  };

  return (
    <div className="flex flex-wrap order-1 gap-4 items-center">
      <SlideCountSelect
        value={config.slides}
        onValueChange={(value) => onConfigChange("slides", value)}
      />
      <LanguageSelect
        value={config.language}
        onValueChange={(value) => onConfigChange("language", value)}
        open={openLanguage}
        onOpenChange={setOpenLanguage}
      />
      <ToolTip content={t('common.advancedSettings')}>

      <button
        aria-label={t('common.advancedSettings')}
        title={t('common.advancedSettings')}
        type="button"
        onClick={() => handleOpenAdvancedChange(true)}
        className="ml-auto flex items-center gap-2 text-sm underline underline-offset-4  bg-blue-100 hover:bg-blue-100 border-blue-200 focus-visible:ring-blue-300 border-none p-2 rounded-md font-instrument_sans font-medium"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
        </ToolTip>

      <Dialog open={openAdvanced} onOpenChange={handleOpenAdvancedChange}>
        <DialogContent className="max-w-2xl font-instrument_sans">
          <DialogHeader>
            <DialogTitle>{t('common.advancedSettings')}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tone */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{t('advanced.tone')}</label>
              <p className="text-xs text-gray-500">{t('advanced.toneDesc')}</p>
              <Select
                value={advancedDraft.tone}
                onValueChange={(value) => setAdvancedDraft((prev) => ({ ...prev, tone: value as ToneType }))}
              >
                <SelectTrigger className="w-full font-instrument_sans capitalize font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300">
                  <SelectValue placeholder={t('advanced.selectTone')} />
                </SelectTrigger>
                <SelectContent className="font-instrument_sans">
                  {Object.values(ToneType).map((tone) => (
                    <SelectItem key={tone} value={tone} className="text-sm font-medium capitalize">
                      {t(getToneTranslationKey(tone))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verbosity */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{t('advanced.verbosity')}</label>
              <p className="text-xs text-gray-500">{t('advanced.verbosityDesc')}</p>
              <Select
                value={advancedDraft.verbosity}
                onValueChange={(value) => setAdvancedDraft((prev) => ({ ...prev, verbosity: value as VerbosityType }))}
              >
                <SelectTrigger className="w-full font-instrument_sans capitalize font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300">
                  <SelectValue placeholder={t('advanced.selectVerbosity')} />
                </SelectTrigger>
                <SelectContent className="font-instrument_sans">
                  {Object.values(VerbosityType).map((verbosity) => (
                    <SelectItem key={verbosity} value={verbosity} className="text-sm font-medium capitalize">
                      {t(getVerbosityTranslationKey(verbosity))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

           

            {/* Toggles */}
            <div className="w-full flex flex-col gap-2 p-3 rounded-md bg-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{t('advanced.includeTableOfContents')}</label>
                <Switch
                  checked={advancedDraft.includeTableOfContents}
                  onCheckedChange={(checked) => setAdvancedDraft((prev) => ({ ...prev, includeTableOfContents: checked }))}
                />
              </div>
              <p className="text-xs text-gray-600">{t('advanced.includeTableOfContentsDesc')}</p>
            </div>
            <div className="w-full flex flex-col gap-2 p-3 rounded-md bg-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{t('advanced.titleSlide')}</label>
                <Switch
                  checked={advancedDraft.includeTitleSlide}
                  onCheckedChange={(checked) => setAdvancedDraft((prev) => ({ ...prev, includeTitleSlide: checked }))}
                />
              </div>
              <p className="text-xs text-gray-600">{t('advanced.titleSlideDesc')}</p>
            </div>
            <div className="w-full flex flex-col gap-2 p-3 rounded-md bg-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{t('advanced.webSearch')}</label>
                <Switch
                  checked={advancedDraft.webSearch}
                  onCheckedChange={(checked) => setAdvancedDraft((prev) => ({ ...prev, webSearch: checked }))}
                />
              </div>
              <p className="text-xs text-gray-600">{t('advanced.webSearchDesc')}</p>
            </div>

            {/* Instructions */}
            <div className="w-full sm:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{t('advanced.instructions')}</label>
              <p className="text-xs text-gray-500">{t('advanced.instructionsDesc')}</p>
              <Textarea
                value={advancedDraft.instructions}
                rows={4}
                onChange={(e) => setAdvancedDraft((prev) => ({ ...prev, instructions: e.target.value }))}
                placeholder={t('advanced.instructionsPlaceholder')}
                className="py-2 px-3 border-2 font-medium text-sm min-h-[100px] max-h-[200px] border-blue-200 focus-visible:ring-offset-0 focus-visible:ring-blue-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenAdvancedChange(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveAdvanced} className="bg-[#5141e5] text-white hover:bg-[#5141e5]/90">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
