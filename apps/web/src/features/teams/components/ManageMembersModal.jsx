import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useTeamRoster, useTeamMutations } from '../hooks/useTeams.js';
import { useEmployees } from '../../employees/hooks/useEmployees.js';
import { UserPlus, UserMinus, Users2 } from 'lucide-react';

export function ManageMembersModal({ isOpen, onClose, team }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const { data: rosterData, isLoading: isLoadingRoster } = useTeamRoster(team?.id);
  const { addMember, isAddingMember, removeMember, isRemovingMember } = useTeamMutations();

  // Fetch all active employees to find eligible candidates
  const { data: allEmployeesData } = useEmployees({
    role: 'EMPLOYEE',
    isActive: true,
    limit: 100,
  });

  const activeMembers = rosterData?.data?.members || [];
  const currentMemberIds = new Set(activeMembers.map((m) => m.id));

  // Eligible employees: role EMPLOYEE, active, and NOT currently assigned to ANY team
  const allEmployees = allEmployeesData?.data || [];
  const eligibleEmployees = allEmployees.filter(
    (emp) => !emp.team_id && !currentMemberIds.has(emp.id),
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !team?.id) return;
    await addMember({ teamId: team.id, employeeId: selectedEmployeeId });
    setSelectedEmployeeId('');
  };

  const handleRemoveMember = async (employeeId) => {
    if (!team?.id) return;
    await removeMember({ teamId: team.id, employeeId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Members: ${team?.name}`}
      description="Assign employees to this team or remove existing members."
      size="lg"
    >
      <div className="space-y-6">
        {/* Add Member Bar */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-primary-600" />
            Add Employee to Team
          </h4>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <Select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="flex-1"
            >
              <option value="">Select unassigned employee...</option>
              {eligibleEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.email})
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedEmployeeId}
              isLoading={isAddingMember}
            >
              Add
            </Button>
          </form>
          {eligibleEmployees.length === 0 && (
            <p className="text-[11px] text-slate-500 mt-1.5">
              All active employees are currently assigned to teams. Remove an employee from their existing team first to reassign them.
            </p>
          )}
        </div>

        {/* Current Roster */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Current Active Members ({activeMembers.length})
          </h4>

          {isLoadingRoster ? (
            <div className="py-6 text-center text-sm text-slate-400">Loading roster...</div>
          ) : activeMembers.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
              <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No members currently in this team.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs">
                      {member.first_name?.[0]}
                      {member.last_name?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {member.email} • {member.active_leads_count || 0} active leads
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleRemoveMember(member.id)}
                    isLoading={isRemovingMember}
                    title="Remove from team"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
