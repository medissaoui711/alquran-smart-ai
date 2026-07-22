#!/bin/bash

echo "================================================="
echo "   أداة تحويل التطبيق (PWA) إلى تطبيق أندرويد (APK)  "
echo "================================================="
echo "تستخدم هذه الأداة Bubblewrap لتحويل موقعك إلى تطبيق أندرويد حقيقي."
echo ""

# الرابط العام المنشور (ais-pre-*)
PUBLIC_HOST="ais-pre-onwvyflreacnxpk3rfa2zc-746375125740.europe-west2.run.app"
APP_URL="https://${PUBLIC_HOST}"

echo "الرابط العام المنشور للتطبيق: $APP_URL"
echo ""

mkdir -p android-app
cd android-app

echo "إنشاء ملف twa-manifest.json بالرابط العام والمواصفات الصحيحة..."
cat << EOF > twa-manifest.json
{
  "packageId": "com.mushafpro.app",
  "host": "$PUBLIC_HOST",
  "name": "القرآن الكريم - المصحف الاحترافي",
  "launcherName": "المصحف",
  "display": "standalone",
  "themeColor": "#10B981",
  "navigationColor": "#10B981",
  "navigationColorDark": "#10B981",
  "navigationDividerColor": "#10B981",
  "navigationDividerColorDark": "#10B981",
  "backgroundColor": "#10B981",
  "enableNotifications": true,
  "startUrl": "/",
  "iconUrl": "$APP_URL/icon-512.png",
  "maskableIconUrl": "$APP_URL/icon-512.png",
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [],
  "generatorApp": "bubblewrap-cli",
  "fallbackType": "customtabs",
  "features": {},
  "alphaDependencies": {
    "enabled": false
  },
  "enableSiteSettingsShortcut": "true",
  "isChromeOSOnly": false,
  "isSplashScreenFadeOutEnabled": true,
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android.keystore",
    "alias": "android"
  },
  "appVersion": "1.0.0"
}
EOF

echo "جاري تحديث واستخراج مشروع الأندرويد..."
npx @bubblewrap/cli update --skipPrompt

echo ""
echo "جاري بناء ملف الـ APK..."
npx @bubblewrap/cli build

echo ""
echo "================================================="
echo "تم الانتهاء بنجاح! ستجد ملف الـ APK باسم app-release-signed.apk في مجلد android-app"
echo "================================================="

