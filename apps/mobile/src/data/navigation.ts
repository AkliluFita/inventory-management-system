import { router } from "expo-router";

/** A route may be opened directly, without a previous screen in its navigator. */
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)/home");
}
