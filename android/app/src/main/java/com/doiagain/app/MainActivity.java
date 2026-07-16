package com.doiagain.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String APP_URL = "https://doi-again.vercel.app";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        webView.setWebViewClient(new WebViewClient() {

            private boolean errorShown = false;

            @Override
            public void onPageFinished(android.webkit.WebView view, String url) {
                super.onPageFinished(view, url);
                errorShown = false;
            }

            @Override
            public void onReceivedError(android.webkit.WebView view,
                                        WebResourceRequest request,
                                        WebResourceError error) {
                // Only intercept errors for the main frame
                if (request.isForMainFrame() && !errorShown) {
                    errorShown = true;
                    showOfflinePage(view);
                }
            }
        });
    }

    private void showOfflinePage(WebView view) {
        String offlineHtml = "<!DOCTYPE html>"
            + "<html lang='en'>"
            + "<head>"
            + "<meta charset='UTF-8'>"
            + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
            + "<title>No Connection</title>"
            + "<style>"
            + "* { margin:0; padding:0; box-sizing:border-box; }"
            + "body {"
            + "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
            + "  background: #111827; color: #f9fafb;"
            + "  display: flex; flex-direction: column;"
            + "  align-items: center; justify-content: center;"
            + "  min-height: 100vh; padding: 2rem; text-align: center;"
            + "}"
            + ".icon { font-size: 5rem; margin-bottom: 1.5rem; }"
            + "h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; }"
            + "p { color: #9ca3af; font-size: 1rem; max-width: 280px; line-height: 1.6; margin-bottom: 2rem; }"
            + "button {"
            + "  background: #3b82f6; color: white; border: none;"
            + "  border-radius: 0.75rem; padding: 0.875rem 2.5rem;"
            + "  font-size: 1rem; font-weight: 600; cursor: pointer;"
            + "}"
            + "button:active { background: #2563eb; }"
            + ".sub { margin-top: 1rem; font-size: 0.8rem; color: #6b7280; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "<div class='icon'>&#x1F4F5;</div>"
            + "<h1>No Internet Connection</h1>"
            + "<p>Turn on mobile data or Wi-Fi, then tap Retry.</p>"
            + "<button onclick=\"window.location.href='" + APP_URL + "'\">Retry</button>"
            + "<p class='sub'>Doi Again</p>"
            + "</body>"
            + "</html>";

        // Use APP_URL as the base so that navigating back to it works correctly
        view.loadDataWithBaseURL(APP_URL, offlineHtml, "text/html", "UTF-8", APP_URL);
    }
}
