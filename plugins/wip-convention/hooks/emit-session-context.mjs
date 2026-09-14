// The Claude twin of the sessionStart prompt in this plugin's root hooks.json. Hand-authored,
// like every file here; node tools/check-assets.mjs fails when the sidecar and the prompt
// stop saying the same thing.
//
// Claude Code refuses to run a prompt-type hook on SessionStart ("prompt-type hooks are not
// supported for SessionStart events (no conversation context is available)") and records the
// refusal as a non-blocking error, so a prompt hook there fails invisibly. The guidance
// therefore ships as this command hook: it reads session-start-context.md next to this file
// and returns the text as additionalContext, which Claude injects into the new session.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sidecar = join(dirname(fileURLToPath(import.meta.url)), 'session-start-context.md');

let additionalContext;
try {
    additionalContext = readFileSync(sidecar, 'utf8').trim();
} catch {
    // Never break session start over missing guidance.
    process.exit(0);
}

if (additionalContext) {
    process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext },
    }));
}
