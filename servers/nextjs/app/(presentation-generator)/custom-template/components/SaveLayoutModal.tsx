"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useUserCode } from "../../hooks/useUserCode";
import { appendUserCodeToPath } from "../../utils/userCode";

interface SaveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (layoutName: string, description: string) => Promise<string | null>;
  isSaving: boolean;
}

export const SaveLayoutModal: React.FC<SaveLayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userCode } = useUserCode();
  const [layoutName, setLayoutName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!layoutName.trim()) {
      return; // Don't save if name is empty
    }
    const id = await onSave(layoutName.trim(), description.trim());
    if (id) {
      // Redirect to the new template preview page
      router.push(appendUserCodeToPath(`/template-preview/custom-${id}`, userCode));
    }
    // Reset form after navigation decision
    setLayoutName("");
    setDescription("");
  };

  const handleClose = () => {
    if (!isSaving) {
      setLayoutName("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            {t('customTemplate.saveTemplate')}
          </DialogTitle>
          <DialogDescription>
            {t('customTemplate.descriptionForTemplate')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="layout-name" className="text-sm font-medium">
              {t('customTemplate.templateName')} *
            </Label>
            <Input
              id="layout-name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder={t('customTemplate.enterTemplateName')}
              disabled={isSaving}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t('customTemplate.description')}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('customTemplate.enterDescription')}
              disabled={isSaving}
              className="w-full resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !layoutName.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('customTemplate.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('customTemplate.saveTemplate')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 