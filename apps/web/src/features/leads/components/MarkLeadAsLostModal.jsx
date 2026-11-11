import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { LOSS_REASONS } from '../leads.constants.js';

export function MarkLeadAsLostModal({
  isOpen,
  onClose,
  onConfirm,
  leadName = '',
  isLoading = false,
}) {
  const [lossReason, setLossReason] = useState(LOSS_REASONS[0]);
  const [lossNotes, setLossNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!lossReason || !lossReason.trim()) {
      setError('Please select a loss reason');
      return;
    }

    if (lossReason === 'Other' && (!lossNotes || !lossNotes.trim())) {
      setError('Please provide an explanation in additional notes when selecting "Other"');
      return;
    }

    onConfirm({
      loss_reason: lossReason,
      loss_notes: lossNotes.trim() || null,
    });
  };

  const handleClose = () => {
    if (isLoading) return;
    setError('');
    setLossNotes('');
    setLossReason(LOSS_REASONS[0]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark Lead as Lost"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-rose-950">
              Moving &quot;{leadName}&quot; to Lost
            </p>
            <p className="text-rose-700 mt-0.5">
              To keep pipeline reports and drop-off analytics accurate, please record why this opportunity did not close.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Select
            label="Loss Reason *"
            value={lossReason}
            onChange={(e) => {
              setLossReason(e.target.value);
              if (error) setError('');
            }}
          >
            {LOSS_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Textarea
            label={lossReason === 'Other' ? 'Explanation / Notes *' : 'Additional Notes (Optional)'}
            placeholder={
              lossReason === 'Other'
                ? 'Specify why this deal was lost...'
                : 'Any extra context, customer feedback, or future re-engagement timing...'
            }
            rows={3}
            maxLength={500}
            showCount
            autoGrow
            value={lossNotes}
            onChange={(e) => {
              setLossNotes(e.target.value);
              if (error) setError('');
            }}
          />
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isLoading}
          >
            Mark as Lost
          </Button>
        </div>
      </form>
    </Modal>
  );
}

