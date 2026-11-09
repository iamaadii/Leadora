import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { CheckCircle2 } from 'lucide-react';

export function CompleteFollowupModal({
  isOpen,
  onClose,
  followup = null,
  onComplete,
  isLoading = false,
}) {
  const [completionNotes, setCompletionNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(completionNotes.trim() || undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Follow-up Task"
      description={`Mark "${followup?.title || 'Task'}" as completed.`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
          <p className="font-semibold">Logging Follow-up Outcome</p>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            Record meeting takeaways or conversation highlights. These notes are appended to the
            lead&apos;s permanent timeline.
          </p>
        </div>

        <Textarea
          label="Outcome & Meeting Notes (Optional)"
          placeholder="e.g., Client requested updated proposal with 20 seats. Follow up next Tuesday."
          rows={3}
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
        />

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            leftIcon={CheckCircle2}
            isLoading={isLoading}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Mark as Completed
          </Button>
        </div>
      </form>
    </Modal>
  );
}
