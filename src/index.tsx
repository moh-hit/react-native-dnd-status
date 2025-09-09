import { Platform, NativeEventEmitter, EmitterSubscription } from "react-native"
import NativeDndStatus, { type DndChangedPayload } from "./NativeDndStatus"

export type { DndChangedPayload }

const emitter =
  Platform.OS === "android" ? new NativeEventEmitter(NativeDndStatus) : null

export function addListener(
  eventName: string,
  callback: (p: DndChangedPayload) => void
): {
  remove: () => void
} {
  if (Platform.OS !== "android") return { remove: () => {} }

  NativeDndStatus.addListener(eventName)
  const sub: EmitterSubscription = emitter!.addListener(eventName, callback)

  return {
    remove: () => {
      sub.remove()
      NativeDndStatus.removeListeners(1)
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
