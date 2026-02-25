import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HowToDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: () => void;
}

export function HowToDialog({ open, onOpenChange, onAcknowledge }: HowToDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>How to measure</DialogTitle>
          <DialogDescription>Five steps. Two readings.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
          {[
            { src: "/howto/step-1.png", alt: "Step 1: Weigh the club in grams" },
            { src: "/howto/step-2.png", alt: "Step 2: Find the exact club balance point" },
            { src: "/howto/step-3.png", alt: "Step 3: Mark the shaft at the balance point" },
            { src: "/howto/step-4.png", alt: "Step 4: Measure from grip end to the mark" },
            { src: "/howto/step-5.png", alt: "Step 5: Enter readings in calculator" },
          ].map((step) => (
            <Card key={step.src} className="overflow-hidden bg-transparent py-0 shadow-none">
              <img
                src={step.src}
                alt={step.alt}
                className="h-auto w-full"
                loading="lazy"
                decoding="async"
              />
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              onAcknowledge();
              onOpenChange(false);
            }}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

