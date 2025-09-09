Got it ✅ — here’s a **final README.md** for your package, now with a nice set of badges at the top (npm version, license, React Native compatibility, and TypeScript ready).

---

# react-native-dnd-status

[![npm version](https://img.shields.io/npm/v/react-native-dnd-status.svg)](https://www.npmjs.com/package/react-native-dnd-status)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![React Native](https://img.shields.io/badge/react--native-%3E%3D0.72-61dafb.svg)
![TypeScript](https://img.shields.io/badge/types-included-brightgreen.svg)

🔕 A React Native TurboModule to **detect and listen to Do Not Disturb (DND) mode on Android**.
Check if DND is active, subscribe to state changes, and verify if your app’s notification channels are allowed to bypass DND.
_(On iOS, this module is stubbed since Apple does not expose DND state through public APIs.)_

---

## ✨ Features

- ✅ Check if the device is currently in **Do Not Disturb** mode
- ✅ Listen for **DND state changes** in real time
- ✅ Get the current **interruption filter** (`ALL`, `PRIORITY`, `ALARMS`, `NONE`)
- ✅ Check if **app notifications are enabled**
- ✅ Detect if **POST_NOTIFICATIONS permission** is granted (Android 13+)
- ✅ Verify if a **notification channel can bypass DND**
- ⚠️ **iOS**: returns safe defaults (DND always `false`)

---

## 📦 Installation

```bash
yarn add react-native-dnd-status
```

or

```bash
npm install react-native-dnd-status
```

### iOS

No setup needed (stubbed).

### Android

- **minSdkVersion**: 23+
- No permissions are required to _read_ DND state.
- If you want to **post notifications** on Android 13+, request `POST_NOTIFICATIONS` at runtime.
- To let a channel bypass DND, create it with `.setBypassDnd(true)` and instruct users to allow it in system settings.

---

## ⚡️ Usage

```tsx
import React, { useEffect, useState } from "react"
import { SafeAreaView, Text } from "react-native"
import {
  isDndEnabled,
  addDndListener,
  getInterruptionFilter,
  canNotifyDuringDnd,
} from "react-native-dnd-status"

export default function App() {
  const [enabled, setEnabled] = useState(false)
  const [filter, setFilter] = useState<number | null>(null)

  useEffect(() => {
    isDndEnabled().then(setEnabled)
    getInterruptionFilter().then(setFilter)

    const sub = addDndListener(({ enabled, interruptionFilter }) => {
      setEnabled(enabled)
      setFilter(interruptionFilter)
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    ;(async () => {
      const canBypass = await canNotifyDuringDnd("alerts")
      console.log("alerts can bypass DND:", canBypass)
    })()
  }, [])

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        DND: {enabled ? "ON" : "OFF"}
      </Text>
      <Text>Filter: {filter}</Text>
    </SafeAreaView>
  )
}
```

---

## 📚 API

### `isDndEnabled(): Promise<boolean>`

Returns `true` if the device is in DND.

### `getInterruptionFilter(): Promise<number>`

Returns the Android `NotificationManager` interruption filter:

- `1` → `ALL`
- `2` → `PRIORITY`
- `3` → `NONE`
- `4` → `ALARMS`

### `addDndListener(callback)`

Subscribe to DND changes. Returns a subscription with `.remove()`.

### `canNotifyDuringDnd(channelId: string): Promise<boolean>`

Checks if the given notification channel can bypass DND. (API 26+)

### `areNotificationsEnabled(): Promise<boolean>`

Checks if notifications are enabled for the app.

### `hasPostNotificationsPermission(): Promise<boolean>`

Checks if the app has runtime `POST_NOTIFICATIONS` permission (Android 13+).

### `isNotificationPolicyAccessGranted(): Promise<boolean>`

Checks if the app has **Notification Policy Access** (needed to _modify_ DND).

---

## 🔔 Creating a Channel that Can Bypass DND

### Kotlin (in your app’s Android code)

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
  val channel = NotificationChannel(
    "alerts", // channelId
    "Alerts", // name
    NotificationManager.IMPORTANCE_HIGH
  ).apply {
    setBypassDnd(true) // request bypass
    enableVibration(true)
  }

  val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
  nm.createNotificationChannel(channel)
}
```

### React Native (JS)

```ts
import { canNotifyDuringDnd } from "react-native-dnd-status"

;(async () => {
  const allowed = await canNotifyDuringDnd("alerts")
  if (!allowed) {
    console.log("User has not allowed this channel to bypass DND")
  }
})()
```

👉 You can deep-link users to the system channel settings if needed.

---

## ⚠️ Limitations

- **iOS**: No API for DND state → always returns defaults.
- **Android < 23**: No DND APIs → always returns `false`.
- **Bypass DND**: Even if you request it, the user must approve in system settings.

---

## 🛠 Development

```bash
# build the library
yarn build

# run example app
cd example
yarn android
```

---

## 📄 License

MIT © 2025 Mohit Kumar

---
