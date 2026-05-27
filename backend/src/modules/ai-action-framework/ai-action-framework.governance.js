const repo     = require('./ai-action-framework.repository');
const registry = require('./ai-action-framework.registry');

const GOVERNANCE_MODES = ['strict', 'standard', 'flexible'];

async function getGovernanceMode(workspaceId) {
  const policy = await repo.getPolicy(workspaceId, 'governance_mode');
  return policy?.configuration?.mode || 'standard';
}

// Returns true if this action requires human approval before execution
async function requiresApproval(workspaceId, riskLevel, actionType) {
  const mode = await getGovernanceMode(workspaceId);
  const meta = registry.getActionTypeMeta(actionType);

  if (mode === 'strict') return true;

  if (mode === 'flexible') {
    // Only critical risk or explicitly flagged action types require approval
    return riskLevel === 'critical' || (meta?.requiresApproval && riskLevel !== 'low');
  }

  // standard (default): high/critical risk or action type always requires approval
  return riskLevel === 'high' || riskLevel === 'critical' || meta?.requiresApproval === true;
}

// Returns a risk assessment object based on action properties
function assessRisk(actionType, payload) {
  const meta = registry.getActionTypeMeta(actionType);
  const baseRisk = meta?.defaultRisk || 'medium';

  const assessment = {
    level: baseRisk,
    businessImpact: 'low',
    operationalImpact: 'low',
    complianceImpact: 'low',
    securityImpact: 'low',
    summary: '',
  };

  if (actionType === 'UPDATE_COMPLIANCE_STATUS') {
    assessment.complianceImpact = 'high';
    assessment.summary = 'Changes to compliance status affect regulatory reporting.';
  } else if (actionType === 'SEND_EMAIL') {
    assessment.operationalImpact = 'medium';
    assessment.summary = 'Sending external communications represents moderate operational impact.';
  } else if (actionType === 'ESCALATE_COMPLIANCE_ITEM') {
    assessment.complianceImpact = 'medium';
    assessment.summary = 'Escalation alerts management and affects team workflows.';
  } else if (actionType === 'CREATE_REMINDER') {
    assessment.summary = 'Creating a reminder has minimal impact and aids compliance tracking.';
  } else if (actionType === 'PREPARE_CHECKLIST') {
    assessment.summary = 'Preparing a checklist is a read-only planning action with no direct system impact.';
  } else if (actionType === 'GENERATE_DOCUMENT') {
    assessment.operationalImpact = 'low';
    assessment.summary = 'Document generation creates a draft for human review.';
  } else {
    assessment.summary = `Action type "${actionType}" has been assessed with ${baseRisk} default risk.`;
  }

  return assessment;
}

// Determine which approvers to notify for an action (returns role labels for now)
function determineApprovers(riskLevel, role) {
  if (riskLevel === 'critical') return ['owner', 'admin'];
  if (riskLevel === 'high')     return ['admin'];
  return ['admin'];
}

module.exports = { getGovernanceMode, requiresApproval, assessRisk, determineApprovers, GOVERNANCE_MODES };
