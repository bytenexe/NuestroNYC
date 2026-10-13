import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const UNLOCK_KEY = 'nuestro.family.unlock.v1';

const unlockSubscribers = new Set();
const stateSubscribers = new Set();

let cachedUser = null;
let workspaceState;
let workspaceUserId = null;
let workspaceRequest = null;

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function emitState() {
  const snapshot = { workspace: workspaceState, userId: workspaceUserId };
  stateSubscribers.forEach((notify) => notify(snapshot));
}

export function setFamilyUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(UNLOCK_KEY, '1');
    else sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* storage unavailable: keep the session in memory only */
  }
  unlockSubscribers.forEach((notify) => notify(value));
}

export async function currentUser() {
  if (!cachedUser) {
    cachedUser = await base44.auth.me().catch(() => null);
  }
  return cachedUser;
}

/** One shared lookup per session: many rows can ask for family access at once. */
async function ensureWorkspace() {
  if (workspaceState !== undefined) return workspaceState;
  if (!workspaceRequest) {
    workspaceRequest = (async () => {
      const user = await currentUser();
      workspaceUserId = user?.id || null;
      if (!user) return null;
      const list = await base44.entities.FamilyWorkspace.filter({ member_ids: user.id }, { limit: 1 }).catch(() => []);
      return list?.[0] || null;
    })()
      .then((found) => {
        workspaceState = found || null;
        emitState();
        return workspaceState;
      })
      .catch(() => {
        workspaceState = null;
        emitState();
        return null;
      });
  }
  return workspaceRequest;
}

export async function refreshFamilyAccess() {
  cachedUser = null;
  workspaceState = undefined;
  workspaceRequest = null;
  return ensureWorkspace();
}

/**
 * Family access state: the shared workspace (if any), whether shared records are
 * unlocked for this session, and helpers to hide shared records while locked.
 */
export function useFamilyAccess() {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [state, setState] = useState({ workspace: workspaceState, userId: workspaceUserId });

  useEffect(() => {
    unlockSubscribers.add(setUnlocked);
    stateSubscribers.add(setState);
    ensureWorkspace();
    return () => {
      unlockSubscribers.delete(setUnlocked);
      stateSubscribers.delete(setState);
    };
  }, []);

  const unlock = useCallback(() => setFamilyUnlocked(true), []);
  const lock = useCallback(() => setFamilyUnlocked(false), []);

  const hidden = useCallback(
    (records) => {
      if (unlocked) return [];
      return (records || []).filter((record) => record?.shared && record.created_by_id !== state.userId);
    },
    [unlocked, state.userId]
  );

  const visible = useCallback(
    (records) => {
      if (unlocked) return records || [];
      return (records || []).filter((record) => !record?.shared || record.created_by_id === state.userId);
    },
    [unlocked, state.userId]
  );

  return {
    unlocked,
    unlock,
    lock,
    workspace: state.workspace,
    userId: state.userId,
    refresh: refreshFamilyAccess,
    visible,
    hidden,
  };
}