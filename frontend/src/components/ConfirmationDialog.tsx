"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageProvider";
import { ClipLoader } from "react-spinners";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isConfirming: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isConfirming,
}: ConfirmationDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-0 rounded-3xl">
        <DialogHeader className="p-6">
          <DialogTitle className="text-xl font-bold text-gray-800">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-6 bg-gray-50 rounded-b-3xl">
          <DialogClose asChild>
            <Button type="button" variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button onClick={onConfirm} disabled={isConfirming} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
            {isConfirming ? <ClipLoader size={20} color={"#ffffff"} /> : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}