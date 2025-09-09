package com.dndstatus

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class DndStatusModule(private val context: ReactApplicationContext) : NativeDndStatusSpec(context) {

  private var receiver: BroadcastReceiver? = null
  private var listenerCount = 0

  override fun getName(): String = NAME

  @ReactMethod
  override fun addListener(eventName: String?) {
    listenerCount += 1
    if (receiver == null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      val filter = IntentFilter(NotificationManager.ACTION_INTERRUPTION_FILTER_CHANGED)
      receiver =
              object : BroadcastReceiver() {
                override fun onReceive(c: Context?, i: Intent?) {
                  sendState()
                }
              }
      context.registerReceiver(receiver, filter)
    }
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    listenerCount -= count.toInt()
    if (listenerCount <= 0 && receiver != null) {
      context.unregisterReceiver(receiver)
      receiver = null
      listenerCount = 0
    }
  }

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    receiver?.let { context.unregisterReceiver(it) }
    receiver = null
  }

  @ReactMethod
  override fun isDndEnabled(promise: Promise) =
          try {
            promise.resolve(isDnd(currentFilter()))
          } catch (e: Exception) {
            promise.reject("DND_ERROR", e)
          }

  @ReactMethod
  override fun getInterruptionFilter(promise: Promise) =
          try {
            promise.resolve(currentFilter())
          } catch (e: Exception) {
            promise.reject("DND_ERROR", e)
          }

  @ReactMethod
  override fun canNotifyDuringDnd(channelId: String, promise: Promise) {
    try {
      val nm = nm() ?: return promise.resolve(false)
      if (!areAppNotificationsEnabled() || !hasPostNotificationsPermission())
              return promise.resolve(false)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val ch: NotificationChannel? = nm.getNotificationChannel(channelId)
        return promise.resolve(ch?.canBypassDnd() == true)
      }
      promise.resolve(false)
    } catch (e: Exception) {
      promise.reject("DND_ERROR", e)
    }
  }

  @ReactMethod
  override fun areNotificationsEnabled(promise: Promise) =
          try {
            promise.resolve(areAppNotificationsEnabled())
          } catch (e: Exception) {
            promise.reject("DND_ERROR", e)
          }

  @ReactMethod
  override fun hasPostNotificationsPermission(promise: Promise) =
          try {
            promise.resolve(hasPostNotificationsPermission())
          } catch (e: Exception) {
            promise.reject("DND_ERROR", e)
          }

  @ReactMethod
  override fun isNotificationPolicyAccessGranted(promise: Promise) {
    try {
      val nm = nm()
      if (nm == null) promise.resolve(false)
      else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
              promise.resolve(nm.isNotificationPolicyAccessGranted)
      else promise.resolve(false)
    } catch (e: Exception) {
      promise.reject("DND_ERROR", e)
    }
  }

  private fun nm(): NotificationManager? =
          context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

  private fun currentFilter(): Int =
          nm()?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) it.currentInterruptionFilter
            else NotificationManager.INTERRUPTION_FILTER_ALL
          }
                  ?: NotificationManager.INTERRUPTION_FILTER_ALL

  private fun isDnd(filter: Int) = filter != NotificationManager.INTERRUPTION_FILTER_ALL

  private fun areAppNotificationsEnabled(): Boolean = (nm()?.areNotificationsEnabled() == true)

  private fun hasPostNotificationsPermission(): Boolean =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
                    PackageManager.PERMISSION_GRANTED
          } else true

  private fun sendEvent(name: String, data: com.facebook.react.bridge.WritableMap) {
    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(name, data)
  }

  private fun sendState() {
    val f = currentFilter()
    val map =
            Arguments.createMap().apply {
              putBoolean("enabled", isDnd(f))
              putInt("interruptionFilter", f)
            }
    sendEvent("dndChanged", map)
  }

  companion object {
    const val NAME = "DndStatus"
  }
}
