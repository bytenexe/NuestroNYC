import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SHARED_ENTITIES = ['Document', 'Case', 'Reminder', 'JourneyMilestone', 'TrustedContact', 'EmergencyPlan'];

function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `FAM-${out}`;
}

function makeMfaCode() {
  let out = '';
  for (let i = 0; i < 6; i += 1) out += String(Math.floor(Math.random() * 10));
  return out;
}

function without(list, value) {
  return (list || []).filter((item) => item !== value);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === 'create') {
      const name = String(body?.name || '').trim().slice(0, 60) || 'Familia';
      const workspace = await base44.asServiceRole.entities.FamilyWorkspace.create({
        name,
        join_code: makeJoinCode(),
        mfa_code: makeMfaCode(),
        owner_email: user.email,
        member_ids: [user.id],
        member_emails: [user.email],
      });
      await base44.asServiceRole.entities.User.update(user.id, { family_workspace_id: workspace.id });
      return Response.json({ workspace });
    }

    if (action === 'join') {
      const joinCode = String(body?.join_code || '').trim().toUpperCase();
      const mfaCode = String(body?.mfa_code || '').trim();
      if (!joinCode || !mfaCode) return Response.json({ error: 'missing_codes' }, { status: 400 });

      const found = await base44.asServiceRole.entities.FamilyWorkspace.filter({ join_code: joinCode });
      const workspace = found?.[0];
      if (!workspace) return Response.json({ error: 'invalid_code' }, { status: 404 });
      if (String(workspace.mfa_code) !== mfaCode) return Response.json({ error: 'invalid_mfa' }, { status: 403 });

      const memberIds = Array.from(new Set([...(workspace.member_ids || []), user.id]));
      const memberEmails = Array.from(new Set([...(workspace.member_emails || []), user.email]));
      const updated = await base44.asServiceRole.entities.FamilyWorkspace.update(workspace.id, {
        member_ids: memberIds,
        member_emails: memberEmails,
      });
      await base44.asServiceRole.entities.User.update(user.id, { family_workspace_id: workspace.id });
      await Promise.allSettled(
        SHARED_ENTITIES.map((entity) =>
          base44.asServiceRole.entities[entity].updateMany(
            { workspace_id: workspace.id, shared: true },
            { $addToSet: { members: user.id } }
          )
        )
      );
      return Response.json({ workspace: updated });
    }

    if (action === 'leave') {
      const memberships = await base44.asServiceRole.entities.FamilyWorkspace.filter({ member_ids: user.id });
      for (const workspace of memberships) {
        await base44.asServiceRole.entities.FamilyWorkspace.update(workspace.id, {
          member_ids: without(workspace.member_ids, user.id),
          member_emails: without(workspace.member_emails, user.email),
        });
      }
      await base44.asServiceRole.entities.User.update(user.id, { family_workspace_id: '' });
      await Promise.allSettled(
        SHARED_ENTITIES.map((entity) =>
          base44.asServiceRole.entities[entity].updateMany({ members: user.id }, { $pull: { members: user.id } })
        )
      );
      return Response.json({ left: memberships.map((workspace) => workspace.id) });
    }

    const owned = await base44.asServiceRole.entities.FamilyWorkspace.filter({ created_by_id: user.id });
    const mine = owned?.[0];

    if (action === 'rotate') {
      if (!mine) return Response.json({ error: 'no_workspace' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.FamilyWorkspace.update(mine.id, {
        join_code: makeJoinCode(),
        mfa_code: makeMfaCode(),
      });
      return Response.json({ workspace: updated });
    }

    if (action === 'removeMember') {
      if (!mine) return Response.json({ error: 'no_workspace' }, { status: 404 });
      const memberId = String(body?.member_id || '');
      if (!memberId || memberId === user.id) return Response.json({ error: 'invalid_member' }, { status: 400 });
      const memberEmail = (mine.member_emails || [])[0];
      const updated = await base44.asServiceRole.entities.FamilyWorkspace.update(mine.id, {
        member_ids: without(mine.member_ids, memberId),
        member_emails: (mine.member_emails || []).filter((email) => email !== memberEmail || mine.member_ids?.[0] === memberId),
      });
      await base44.asServiceRole.entities.User.update(memberId, { family_workspace_id: '' });
      await Promise.allSettled(
        SHARED_ENTITIES.map((entity) =>
          base44.asServiceRole.entities[entity].updateMany({ members: memberId }, { $pull: { members: memberId } })
        )
      );
      return Response.json({ workspace: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}