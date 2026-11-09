import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { CalendarClock, Plus } from 'lucide-react';

export function FollowupsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleScheduleTask = (e) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    toast.info('Follow-up scheduling API will be activated in Phase 7 (Follow-up & Task Management).', 'Phase 4 Design System');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups & Tasks"
        description="Never drop a lead. Plan and execute phone calls, emails, demos, and follow-up touchpoints."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Follow-ups' },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Follow-up
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'PENDING'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Tasks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'COMPLETED'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed History
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-12 shadow-xs">
        <EmptyState
          icon={CalendarClock}
          title={activeTab === 'PENDING' ? 'No pending follow-ups' : 'No completed tasks'}
          description={
            activeTab === 'PENDING'
              ? 'You have no scheduled calls or meetings due. Schedule your next customer touchpoint to keep prospects engaged.'
              : 'Completed tasks will be recorded here for compliance and historical tracking.'
          }
          actionText={activeTab === 'PENDING' ? 'Schedule Follow-up' : undefined}
          onAction={activeTab === 'PENDING' ? () => setIsScheduleModalOpen(true) : undefined}
        />
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Follow-up Task"
        description="Set a reminder for a phone call, email, or client meeting."
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleScheduleTask}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleScheduleTask} className="space-y-4">
          <Input label="Task Title" placeholder="e.g. Call to discuss proposal terms" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Activity Type" defaultValue="CALL">
              <option value="CALL">Phone Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting / Demo</option>
            </Select>
            <Input label="Scheduled Date & Time" type="datetime-local" required />
          </div>
          <Textarea label="Notes / Objective" placeholder="Add preparation notes or talking points..." />
        </form>
      </Modal>
    </div>
  );
}
