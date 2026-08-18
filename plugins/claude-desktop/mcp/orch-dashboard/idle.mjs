// Idle-run detection for orch-dashboard runs.
//
// A run only leaves `in_progress` when `finish_run` is called, and that happens in the
// Create Pull Request phase. Personal Validation sits before it and is a *human* gate by
// design — the orchestrator hands control back and waits. When the user never answers,
// the run stays `in_progress` forever. Left alone such a run keeps accruing wall-clock
// elapsed time (see `summarizeInsights`), keeps absorbing the session's tool telemetry,
// and gets silently re-adopted by the next `start_run` for the same skill.
//
// Idleness is **derived, never stored as a status**. A resumed session that calls
// `update_stage` / `set_run_context` refreshes `updatedAt` and clears the stamp, and the
// run is simply live again — no state machine to unwind. Two signals feed it:
//
//   1. `idleSince` — stamped by the SessionEnd hook when the owning session ends.
//      Definitive: that session is not coming back on its own.
//   2. `updatedAt` older than the threshold — the walk-away case, where the session is
//      still open but nothing has touched the run for hours.

// Personal Validation legitimately waits on a human, so the threshold has to be longer
// than a lunch break and shorter than a night. SessionEnd covers the common case exactly;
// this is the backstop for a session left open.
export const DEFAULT_IDLE_AFTER_MS = 4 * 60 * 60 * 1000;

export function idleAfterMs() {
    const minutes = Number(process.env.ORCH_DASHBOARD_IDLE_AFTER_MINUTES);
    if (Number.isFinite(minutes) && minutes > 0) return minutes * 60 * 1000;
    return DEFAULT_IDLE_AFTER_MS;
}

// Timestamp (ms) at which the run stopped progressing, or null while it is live or
// already finished.
export function idleSinceMs(run, now = Date.now()) {
    if (!run || run.status !== "in_progress") return null;
    const stamped = run.idleSince ? new Date(run.idleSince).getTime() : NaN;
    if (Number.isFinite(stamped)) return stamped;
    const updated = run.updatedAt ? new Date(run.updatedAt).getTime() : NaN;
    if (!Number.isFinite(updated)) return null;
    return now - updated >= idleAfterMs() ? updated : null;
}

export function isIdle(run, now = Date.now()) {
    return idleSinceMs(run, now) !== null;
}

// The moment a run's clock should stop: `now` while it is live, the idle point once it is
// not, and `updatedAt` once it has finished. Callers use this instead of `Date.now()` so
// an abandoned gate does not report hours of waiting as elapsed orchestration time.
export function effectiveEndedAtMs(run, now = Date.now()) {
    if (!run) return null;
    if (run.status === "in_progress") return idleSinceMs(run, now) ?? now;
    const updated = run.updatedAt ? new Date(run.updatedAt).getTime() : NaN;
    return Number.isFinite(updated) ? updated : null;
}

// Called wherever a run is written after real progress. Clearing the stamp is what makes
// a resumed run live again without any explicit "unpause" step.
export function clearIdle(run) {
    if (run && run.idleSince) delete run.idleSince;
    return run;
}

export function markIdle(run, at = new Date().toISOString()) {
    if (run && run.status === "in_progress" && !run.idleSince) run.idleSince = at;
    return run;
}
