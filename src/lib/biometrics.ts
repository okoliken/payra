import * as LocalAuthentication from "expo-local-authentication";

/**
 * Face ID (or Touch ID) with "Use PIN" as the way out. Resolves false when there is no enrolled
 * biometry or the person cancels, so callers fall back to the PIN pad. In the iOS Simulator,
 * enable Features → Face ID → Enrolled, then pick Matching / Non-matching Face when prompted.
 */
export async function authenticate(promptMessage: string) {
  try {
    if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Use PIN",
      disableDeviceFallback: true,
    });
    return result.success;
  } catch {
    return false;
  }
}
