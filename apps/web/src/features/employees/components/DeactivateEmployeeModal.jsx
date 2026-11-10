import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { AlertCircle, AlertTriangle, Users, CalendarClock, ShieldAlert } from 'lucide-react';
import { employeesService } from '../services/employees.service.js';

export function DeactivateEmployeeModal({
  isOpen,
  onClose,
  employee,
  allEmployees = [],
  onConfirm,
  isLoading = false,
}) {
  const [workload, setWorkload] = useState(null);
  const [isFetchingWorkload, setIsFetchingWorkload] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [reassignLeadsToId, setReassignLeadsToId] = useState('');
  const [reassignFollowupsToId, setReassignFollowupsToId] = useState('');
  const [leaveLeadsUnassigned, setLeaveLeadsUnassigned] = useState(false);
  const [leaveFollowupsUnassigned, setLeaveFollowupsUnassigned] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Other active colleagues eligible to receive workload
  const eligibleColleagues = allEmployees.filter(
    (e) => e.id !== employee?.id && e.is_active,
  );

  useEffect(() => {
    if (!isOpen || !employee?.id) {
      setWorkload(null);
      setFetchError(null);
      setValidationError('');
      setReassignLeadsToId('');
      setReassignFollowupsToId('');
      setLeaveLeadsUnassigned(false);
      setLeaveFollowupsUnassigned(false);
      return;
    }

    let isMounted = true;
    async function fetchWorkload() {
      setIsFetchingWorkload(true);
      setFetchError(null);
      try {
        const res = await employeesService.getEmployeeWorkload(employee.id);
        if (isMounted) {
          setWorkload(res.data);
          // Set initial target colleague if available
          if (eligibleColleagues.length > 0) {
            setReassignLeadsToId(eligibleColleagues[0].id);
            setReassignFollowupsToId(eligibleColleagues[0].id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(
            err.response?.data?.message || 'Failed to inspect employee workload.',
          );
        }
      } finally {
        if (isMounted) {
          setIsFetchingWorkload(false);
        }
      }
    }

    fetchWorkload();

    return () => {
      isMounted = false;
    };
  }, [isOpen, employee?.id, eligibleColleagues]);

  const hasLedTeams = (workload?.ledTeams?.length || 0) > 0;
  const hasLeads = (workload?.activeLeadsCount || 0) > 0;
  const hasFollowups = (workload?.pendingFollowupsCount || 0) > 0;
  const hasWorkload = hasLeads || hasFollowups;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (hasLedTeams) {
      setValidationError('Cannot deactivate a manager who currently leads active teams.');
      return;
    }

    if (hasLeads && !leaveLeadsUnassigned && !reassignLeadsToId) {
      setValidationError('Please select an employee to receive active leads or choose to leave them unassigned.');
      return;
    }

    if (hasFollowups && !leaveFollowupsUnassigned && !reassignFollowupsToId) {
      setValidationError('Please select an employee to receive pending tasks or choose to cancel them.');
      return;
    }

    onConfirm({
      reassignLeadsToId: leaveLeadsUnassigned ? null : reassignLeadsToId || null,
      reassignFollowupsToId: leaveFollowupsUnassigned ? null : reassignFollowupsToId || null,
      leaveUnassigned: leaveLeadsUnassigned && leaveFollowupsUnassigned,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deactivate ${employee?.first_name || ''} ${employee?.last_name || ''}`}
      size="md"
    >
      {isFetchingWorkload ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Checking employee workload and pipeline assignments...</p>
        </div>
      ) : fetchError ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">Unable to load workload</span>
          </div>
          <p>{fetchError}</p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : hasLedTeams ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Manager Leads Active Teams</span>
            </div>
            <p className="leading-relaxed">
              This employee is currently assigned as manager for active team(s):
            </p>
            <ul className="list-disc list-inside font-semibold text-amber-950 pl-1 space-y-1">
              {workload.ledTeams.map((t) => (
                <li key={t.id}>{t.name}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-800 pt-1">
              Please go to <strong>Teams</strong> and reassign management before deactivating this user.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Workload Impact Notice */}
          {hasWorkload ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Workload Reassignment Required</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  This user currently holds active customer records. Reassign them to an active colleague to prevent deals and touchpoints from being orphaned.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-400 block font-medium">Active Leads</span>
                    <strong className="text-slate-900 text-sm">{workload.activeLeadsCount}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-400 block font-medium">Pending Tasks</span>
                    <strong className="text-slate-900 text-sm">
                      {workload.pendingFollowupsCount}
                      {workload.overdueFollowupsCount > 0 && (
                        <span className="text-rose-600 font-bold ml-1 text-xs">
                          ({workload.overdueFollowupsCount} overdue)
                        </span>
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Lead Reassignment Option */}
              {hasLeads && (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Reassign Leads ({workload.activeLeadsCount})</span>
                    </div>
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leaveLeadsUnassigned}
                        onChange={(e) => setLeaveLeadsUnassigned(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Leave unassigned</span>
                    </label>
                  </div>

                  {!leaveLeadsUnassigned && (
                    <Select
                      label="Assign Leads To"
                      value={reassignLeadsToId}
                      onChange={(e) => setReassignLeadsToId(e.target.value)}
                    >
                      {eligibleColleagues.map((colleague) => (
                        <option key={colleague.id} value={colleague.id}>
                          {colleague.first_name} {colleague.last_name} ({colleague.role})
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              )}

              {/* Follow-up Reassignment Option */}
              {hasFollowups && (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                      <CalendarClock className="w-4 h-4 text-purple-600" />
                      <span>Pending Follow-ups ({workload.pendingFollowupsCount})</span>
                    </div>
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leaveFollowupsUnassigned}
                        onChange={(e) => setLeaveFollowupsUnassigned(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Cancel pending tasks</span>
                    </label>
                  </div>

                  {!leaveFollowupsUnassigned && (
                    <Select
                      label="Assign Tasks To"
                      value={reassignFollowupsToId}
                      onChange={(e) => setReassignFollowupsToId(e.target.value)}
                    >
                      {eligibleColleagues.map((colleague) => (
                        <option key={colleague.id} value={colleague.id}>
                          {colleague.first_name} {colleague.last_name} ({colleague.role})
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">
                Are you sure you want to deactivate {employee?.first_name} {employee?.last_name}?
              </p>
              <p className="text-slate-500 leading-relaxed">
                This employee currently has no active assigned leads or pending tasks. Their login credentials, active sessions, and refresh tokens will be revoked immediately.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isLoading}
            >
              Deactivate Employee
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
