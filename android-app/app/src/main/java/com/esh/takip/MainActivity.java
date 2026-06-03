package com.esh.takip;

import android.annotation.SuppressLint;
import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.JavascriptInterface;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String HOME_URL = "file:///android_asset/site/index.html";
    static final String NOTIFICATION_CHANNEL_ID = "esh_task_reminders";
    private static final int NOTIFICATION_PERMISSION_REQUEST = 4101;
    private FrameLayout rootView;
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        rootView = new FrameLayout(this);
        rootView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootView.setBackgroundColor(getColorResource("status_bar"));

        webView = new WebView(this);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootView.addView(webView);
        setContentView(rootView);
        applySystemBarSpacing();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        createNotificationChannel();
        requestNotificationPermissionIfNeeded();
        webView.addJavascriptInterface(new AndroidNotificationBridge(this), "AndroidNotifications");

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        if (savedInstanceState == null) {
            webView.loadUrl(urlFromIntent(getIntent()));
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (webView != null) {
            webView.loadUrl(urlFromIntent(intent));
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    private void applySystemBarSpacing() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(getColorResource("status_bar"));
            window.setNavigationBarColor(getColorResource("navigation_bar"));
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        } else {
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            rootView.setOnApplyWindowInsetsListener((View view, WindowInsets insets) -> {
                int top;
                int bottom;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    android.graphics.Insets systemBars = insets.getInsets(WindowInsets.Type.systemBars());
                    top = systemBars.top;
                    bottom = systemBars.bottom;
                } else {
                    top = insets.getSystemWindowInsetTop();
                    bottom = insets.getSystemWindowInsetBottom();
                }
                view.setPadding(
                    0,
                    top,
                    0,
                    bottom
                );
                return insets;
            });
            rootView.requestApplyInsets();
        }
    }

    private int getColorResource(String name) {
        int id = getResources().getIdentifier(name, "color", getPackageName());
        return id == 0 ? 0xff0d1f2d : getResources().getColor(id);
    }

    private String urlFromIntent(android.content.Intent intent) {
        String targetHash = intent == null ? "" : intent.getStringExtra("targetHash");
        if (targetHash == null || targetHash.trim().isEmpty()) return HOME_URL;
        if (!targetHash.startsWith("#")) targetHash = "#" + targetHash;
        return HOME_URL + targetHash;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "Gorev hatirlatmalari",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("ESH rutin gorevleri icin yerel hatirlatmalar");
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.createNotificationChannel(channel);
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < 33) return;
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, NOTIFICATION_PERMISSION_REQUEST);
        }
    }

    private boolean hasNotificationPermission() {
        return Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private class AndroidNotificationBridge {
        private final MainActivity activity;

        AndroidNotificationBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void configure(String json) {
            NotificationReceiver.saveConfig(activity, json);
            activity.runOnUiThread(() -> {
                if (NotificationReceiver.isEnabled(activity)) requestNotificationPermissionIfNeeded();
                NotificationReceiver.schedule(activity);
            });
        }

        @JavascriptInterface
        public String getStatus() {
            if (!NotificationReceiver.isEnabled(activity)) return "disabled";
            return hasNotificationPermission() ? "enabled" : "permission-denied";
        }

        @JavascriptInterface
        public void test(String title, String body) {
            activity.runOnUiThread(() -> {
                requestNotificationPermissionIfNeeded();
                NotificationReceiver.showTestNotification(activity, title, body);
            });
        }

        @JavascriptInterface
        public void runNow() {
            activity.runOnUiThread(() -> NotificationReceiver.runCheck(activity, true));
        }
    }
}
