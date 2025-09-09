import type { TurboModule } from "react-native"
import { TurboModuleRegistry } from "react-native"

export type DndChangedPayload = {
  enabled: boolean
  interruptionFilter: number
}

export interface Spec extends TurboModule {
  isDndEnabled(): Promise<boolean>
  getInterruptionFilter(): Promise<number>
  canNotifyDuringDnd(channelId: string): Promise<boolean>
  areNotificationsEnabled(): Promise<boolean>
  hasPostNotificationsPermission(): Promise<boolean>
  isNotificationPolicyAccessGranted(): Promise<boolean>
  addListener(eventName: string): void
  removeListeners(count: number): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("DndStatus")
