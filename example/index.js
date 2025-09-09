import { AppRegistry } from "react-native"
import App from "./src/App"
import { name as appName } from "./app.json"
import { SafeAreaProvider } from "react-native-safe-area-context"

const AppWithProvider = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
)

AppRegistry.registerComponent(appName, () => AppWithProvider)
