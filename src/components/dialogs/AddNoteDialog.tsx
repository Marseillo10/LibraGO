import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Highlight } from "../reader/ReaderContext";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlight: Highlight;
  onSave: (note: string) => void;
}

export function AddNoteDialog({
  open,
  onOpenChange,
  highlight,
  onSave,
}: AddNoteDialogProps) {
  const [note, setNote] = useState(highlight.note || "");

  const handleSave = () => {
    onSave(note);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note to Highlight</DialogTitle>
          <DialogDescription>
            Add a note to your selected text:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm italic text-gray-500 mb-2 p-2 border-l-4">
            "{highlight.text}"
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
