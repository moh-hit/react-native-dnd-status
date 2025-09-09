import { Platform, NativeEventEmitter, EmitterSubscription } from "react-native"
import NativeDndStatus, { type DndChangedPayload } from "./NativeDndStatus"

export type { DndChangedPayload }

const hasRequiredNativeEmitterMethods =
  Platform.OS === "android" &&
  typeof (NativeDndStatus as any)?.addListener === "function" &&
  typeof (NativeDndStatus as any)?.removeListeners === "function"

const emitter = hasRequiredNativeEmitterMethods
  ? new NativeEventEmitter(NativeDndStatus as any)
  : null

export function addListener(
  eventName: string,
  callback: (p: DndChangedPayload) => void
): {
  remove: () => void
} {
  if (!hasRequiredNativeEmitterMethods || !emitter) {
    return { remove: () => {} }
  }

  ;(NativeDndStatus as any).addListener(eventName)
  const sub: EmitterSubscription = emitter.addListener(eventName, callback)

  return {
    remove: () => {
      sub.remove()
      ;(NativeDndStatus as any).removeListeners(1)
    },
  }
}

export function removeListener(subscription: { remove: () => void }) {
  subscription.remove()
}

export function addDndListener(cb: (p: DndChangedPayload) => void): {
  remove: () => void
} {
  return addListener("dndChanged", cb)
}

export async function isDndEnabled() {
  if (Platform.OS !== "android") return false
  return NativeDndStatus.isDndEnabled()
}

export async function getInterruptionFilter() {
  if (Platform.OS !== "android") return 1
  return NativeDndStatus.getInterruptionFilter()
}

export async function canNotifyDuringDnd(channelId: string) {
  if (Platform.OS !== "android") return false
  return NativeDndStatus.canNotifyDuringDnd(channelId)
}

export async function areNotificationsEnabled() {
  if (Platform.OS !== "android") return false
  return NativeDndStatus.areNotificationsEnabled()
}

export async function hasPostNotificationsPermission() {
  if (Platform.OS !== "android") return true
  return NativeDndStatus.hasPostNotificationsPermission()
}

export async function isNotificationPolicyAccessGranted() {
  if (Platform.OS !== "android") return false
  return NativeDndStatus.isNotificationPolicyAccessGranted()
}
