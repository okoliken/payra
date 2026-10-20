import * as LocalAuthentication from "expo-local-authentication";

// The Face ID prompt makes iOS mark the app inactive; the privacy cover checks this so it does not
// blur the app behind a prompt the person just asked for.
let prompting = false;
export const isPromptingBiometrics = () => prompting;

/**
 * Face ID (or Touch ID) with "Use PIN" as the way out. Resolves false when there is no enrolled
 * biometry or the person cancels, so callers fall back to the PIN pad. In the iOS Simulator,
 * enable Features → Face ID → Enrolled, then pick Matching / Non-matching Face when prompted.
 */
export async function authenticate(promptMessage: string) {
  try {
    if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) return false;
    prompting = true;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Use PIN",
      disableDeviceFallback: true,
    });
    return result.success;
  } catch {
    return false;
  } finally {
    // The app turns active again a moment after the prompt closes; keep the flag until then.
    setTimeout(() => (prompting = false), 500);
  }
}
