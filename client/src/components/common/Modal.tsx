import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { eyebrowClass, iconButton } from "@/components/common/styles";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, eyebrow, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#152d23]/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(calc(100%-2rem),420px)] max-h-[calc(100vh-2rem)] overflow-y-auto p-6 border border-white/45 rounded-3xl bg-[#fffdf8] shadow-2xl animate-surface focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex justify-between items-start gap-3 mb-5">
            <div>
              <span className={eyebrowClass}>{eyebrow}</span>
              <Dialog.Title className="mt-1 m-0 text-[#154734] font-serif text-2xl font-bold tracking-tight">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close className={iconButton} aria-label="Close dialog">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
