package com.esh.takip;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;

import org.json.JSONException;
import org.json.JSONObject;

public class NotificationReceiver extends BroadcastReceiver {
    private static final String ACTION_CHECK = "com.esh.takip.NOTIFICATION_CHECK";
    private static final String PREFS = "esh_native_notifications";
    private static final String KEY_CONFIG = "config";
    private static final String KEY_COMMON_CRITICAL_SENT = "common_critical_sent";
    private static final String KEY_COMMON_NORMAL_SENT = "common_normal_sent";
    private static final String KEY_PERSONAL_SENT = "personal_sent";
    private static final String KEY_LAST_CHECK = "last_check";
    private static final int REQUEST_ALARM = 7101;
    private static final int NOTIFICATION_COMMON_CRITICAL = 7201;
    private static final int NOTIFICATION_COMMON_NORMAL = 7202;
    private static final int NOTIFICATION_PERSONAL = 7203;
    private static final int NOTIFICATION_TEST = 7299;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            schedule(context);
            return;
        }
        runCheck(context, false);
        schedule(context);
    }

    static void saveConfig(Context context, String json) {
        prefs(context).edit().putString(KEY_CONFIG, json == null ? "{}" : json).apply();
    }

    static boolean isEnabled(Context context) {
        return config(context).optBoolean("enabled", false);
    }

    static void schedule(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pendingIntent = alarmIntent(context);
        if (alarmManager == null) return;
        alarmManager.cancel(pendingIntent);
        if (!isEnabled(context)) return;

        JSONObject config = config(context);
        int minutes = Math.max(1, Math.min(config.optInt("criticalMinutes", 15), config.optInt("normalMinutes", 30)));
        long triggerAt = SystemClock.elapsedRealtime() + minutes * 60L * 1000L;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, pendingIntent);
        } else {
            alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, pendingIntent);
        }
    }

    static void runCheck(Context context, boolean forceDiagnostic) {
        if (!isEnabled(context)) {
            if (forceDiagnostic) showTestNotification(context, "Android bildirimleri kapali", "Ayarlardan Android uygulama bildirimlerini ac.");
            return;
        }
        if (!hasNotificationPermission(context)) return;

        JSONObject config = config(context);
        prefs(context).edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply();
        if (quietTime(config)) {
            if (forceDiagnostic) showTestNotification(context, "Sessiz saat aktif", "Bildirim kontrolu calisti ama sessiz saat araligindasin.");
            return;
        }

        long now = System.currentTimeMillis();
        SharedPreferences prefs = prefs(context);
        int sent = 0;

        if (config.optBoolean("commonEnabled", true)) {
            int critical = config.optInt("commonCritical", 0);
            int normal = config.optInt("commonNormal", 0);
            if (critical > 0 && (forceDiagnostic || shouldSend(prefs, KEY_COMMON_CRITICAL_SENT, config.optInt("criticalMinutes", 15), now))) {
                notify(context, NOTIFICATION_COMMON_CRITICAL, "Ortak alan kritik gorevler bekliyor", "Bugun tamamlanmamis " + critical + " kritik/mutlaka gorev var.");
                sent++;
            }
            if (normal > 0 && (forceDiagnostic || shouldSend(prefs, KEY_COMMON_NORMAL_SENT, config.optInt("normalMinutes", 30), now))) {
                notify(context, NOTIFICATION_COMMON_NORMAL, "Ortak alan gorevleri tamamlanmadi", "Bugun tamamlanmamis " + (critical + normal) + " ortak gorev var." + (critical > 0 ? " Kritik: " + critical : ""));
                sent++;
            }
        }

        if (config.optBoolean("personalEnabled", true)) {
            int personal = config.optInt("personalCount", 0);
            int overdue = config.optInt("personalOverdue", 0);
            if (personal > 0 && (forceDiagnostic || shouldSend(prefs, KEY_PERSONAL_SENT, config.optInt("normalMinutes", 30), now))) {
                notify(context, NOTIFICATION_PERSONAL, "Kisisel yapilacaklar bekliyor", personal + " kisisel is acik." + (overdue > 0 ? " Geciken: " + overdue : ""));
                sent++;
            }
        }

        if (forceDiagnostic && sent == 0) {
            int common = config.optInt("commonCritical", 0) + config.optInt("commonNormal", 0);
            int personal = config.optInt("personalCount", 0);
            boolean commonEnabled = config.optBoolean("commonEnabled", true);
            boolean personalEnabled = config.optBoolean("personalEnabled", true);
            String reason;
            if (common > 0 && !commonEnabled) {
                reason = "Ortak alan gorev bildirimleri kapali.";
            } else if (personal > 0 && !personalEnabled) {
                reason = "Kisisel yapilacak bildirimleri kapali.";
            } else {
                reason = "Bildirim gerektiren is yok.";
            }
            showTestNotification(context, "Kontrol calisti", "Bekleyen ortak: " + common + ", kisisel: " + personal + ". " + reason);
        }
    }

    static void showTestNotification(Context context, String title, String body) {
        if (!hasNotificationPermission(context)) return;
        notify(context, NOTIFICATION_TEST, empty(title) ? "ESH test bildirimi" : title, empty(body) ? "Android yerel bildirim sistemi calisiyor." : body);
    }

    private static PendingIntent alarmIntent(Context context) {
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.setAction(ACTION_CHECK);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(context, REQUEST_ALARM, intent, flags);
    }

    private static JSONObject config(Context context) {
        try {
            return new JSONObject(prefs(context).getString(KEY_CONFIG, "{}"));
        } catch (JSONException ignored) {
            return new JSONObject();
        }
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static boolean shouldSend(SharedPreferences prefs, String key, int minutes, long now) {
        long interval = Math.max(1, minutes) * 60L * 1000L;
        if (now - prefs.getLong(key, 0L) < interval) return false;
        prefs.edit().putLong(key, now).apply();
        return true;
    }

    private static boolean quietTime(JSONObject config) {
        int start = minutes(config.optString("quietStart", "22:00"));
        int end = minutes(config.optString("quietEnd", "07:00"));
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        int current = calendar.get(java.util.Calendar.HOUR_OF_DAY) * 60 + calendar.get(java.util.Calendar.MINUTE);
        if (start == end) return false;
        return start < end ? current >= start && current < end : current >= start || current < end;
    }

    private static int minutes(String value) {
        try {
            String[] parts = value.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception ignored) {
            return 0;
        }
    }

    private static boolean hasNotificationPermission(Context context) {
        return Build.VERSION.SDK_INT < 33 || context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private static boolean empty(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static void notify(Context context, int id, String title, String body) {
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent contentIntent = PendingIntent.getActivity(context, id, openIntent, flags);

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(context, MainActivity.NOTIFICATION_CHANNEL_ID)
            : new Notification.Builder(context);
        builder
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new Notification.BigTextStyle().bigText(body))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setShowWhen(true);

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(id, builder.build());
    }
}
