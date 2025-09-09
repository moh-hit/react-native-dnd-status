import * as React from "react"
import {
  Platform,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native"
import {
  isDndEnabled,
  canNotifyDuringDnd,
  getInterruptionFilter,
  areNotificationsEnabled,
  hasPostNotificationsPermission,
  isNotificationPolicyAccessGranted,
  addDndListener,
  type DndChangedPayload,
} from "react-native-dnd-status"

interface StatusCardProps {
  title: string
  value: string | boolean
  description: string
  isLoading?: boolean
}

function StatusCard({ title, value, description, isLoading }: StatusCardProps) {
  const displayValue = isLoading
    ? "Loading..."
    : typeof value === "boolean"
    ? value
      ? "✅ Yes"
      : "❌ No"
    : value

  const cardColor =
    typeof value === "boolean" ? (value ? "#E8F5E8" : "#FFF0F0") : "#F8F9FA"

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{displayValue}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  )
}

export default function App() {
  const [dndEnabled, setDndEnabled] = React.useState<boolean>(false)
  const [interruptionFilter, setInterruptionFilter] = React.useState<number>(1)
  const [notificationsEnabled, setNotificationsEnabled] =
    React.useState<boolean>(false)
  const [hasPostPermission, setHasPostPermission] =
    React.useState<boolean>(false)
  const [hasPolicyAccess, setHasPolicyAccess] = React.useState<boolean>(false)
  const [canBypassDnd, setCanBypassDnd] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [listenerActive, setListenerActive] = React.useState<boolean>(false)

  const listenerRef = React.useRef<{ remove: () => void } | null>(null)

  const getFilterName = (filter: number): string => {
    switch (filter) {
      case 1:
        return "All notifications allowed"
      case 2:
        return "Priority notifications only"
      case 3:
        return "No notifications"
      case 4:
        return "Alarms only"
      default:
        return `Filter ${filter}`
    }
  }

  const loadAllData = async () => {
    if (Platform.OS !== "android") {
      setIsLoading(false)
      return
    }

    try {
      const [
        dnd,
        filter,
        notifications,
        postPermission,
        policyAccess,
        canBypass,
      ] = await Promise.all([
        isDndEnabled(),
        getInterruptionFilter(),
        areNotificationsEnabled(),
        hasPostNotificationsPermission(),
        isNotificationPolicyAccessGranted(),
        canNotifyDuringDnd("default"),
      ])

      setDndEnabled(dnd)
      setInterruptionFilter(filter)
      setNotificationsEnabled(notifications)
      setHasPostPermission(postPermission)
      setHasPolicyAccess(policyAccess)
      setCanBypassDnd(canBypass)
    } catch (error) {
      Alert.alert("Error", "Failed to load DND status")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleListener = () => {
    if (Platform.OS !== "android") {
      Alert.alert(
        "iOS Not Supported",
        "DND monitoring is only available on Android"
      )
      return
    }

    if (listenerActive) {
      listenerRef.current?.remove()
      listenerRef.current = null
      setListenerActive(false)
    } else {
      listenerRef.current = addDndListener((payload: DndChangedPayload) => {
        setDndEnabled(payload.enabled)
        setInterruptionFilter(payload.interruptionFilter)
        Alert.alert(
          "DND Status Changed",
          `DND is now ${payload.enabled ? "ON" : "OFF"}`
        )
      })
      setListenerActive(true)
    }
  }

  React.useEffect(() => {
    loadAllData()

    return () => {
      listenerRef.current?.remove()
    }
  }, [])

  if (Platform.OS !== "android") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔕 DND Status Demo</Text>
          <Text style={styles.subtitle}>iOS Not Supported</Text>
        </View>
        <View style={styles.iosMessage}>
          <Text style={styles.iosMessageText}>
            Do Not Disturb monitoring is only available on Android devices. iOS
            does not provide public APIs for DND status detection.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🔕 DND Status Demo</Text>
          <Text style={styles.subtitle}>Monitor Do Not Disturb Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <StatusCard
            title="Do Not Disturb"
            value={dndEnabled}
            description="Whether DND mode is currently active"
            isLoading={isLoading}
          />
          <StatusCard
            title="Interruption Filter"
            value={getFilterName(interruptionFilter)}
            description="Current notification filtering level"
            isLoading={isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions & Access</Text>
          <StatusCard
            title="Notifications Enabled"
            value={notificationsEnabled}
            description="App can show notifications"
            isLoading={isLoading}
          />
          <StatusCard
            title="Post Notifications Permission"
            value={hasPostPermission}
            description="Android 13+ notification permission granted"
            isLoading={isLoading}
          />
          <StatusCard
            title="Policy Access Granted"
            value={hasPolicyAccess}
            description="Can read DND policy settings"
            isLoading={isLoading}
          />
          <StatusCard
            title="Can Bypass DND"
            value={canBypassDnd}
            description="Default channel can bypass DND"
            isLoading={isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: listenerActive ? "#FF6B6B" : "#4ECDC4" },
            ]}
            onPress={toggleListener}
          >
            <Text style={styles.buttonText}>
              {listenerActive ? "Stop Listening" : "Start Listening"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={loadAllData}>
            <Text style={styles.refreshButtonText}>🔄 Refresh Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Toggle your device's Do Not Disturb mode to see real-time updates
            when listener is active.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A202C",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  refreshButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  refreshButtonText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
  },
  iosMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iosMessageText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    lineHeight: 24,
  },
})
