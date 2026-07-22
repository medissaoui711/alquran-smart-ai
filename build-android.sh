#!/bin/bash

echo "================================================="
echo "   أداة تحويل التطبيق (PWA) إلى تطبيق أندرويد (APK)  "
echo "================================================="
echo "تستخدم هذه الأداة Bubblewrap لتحويل موقعك إلى تطبيق أندرويد حقيقي."
echo ""
echo "المتطلبات الأساسية قبل البدء:"
echo "1. يجب أن يكون لديك Java Development Kit (JDK) 17 مثبتاً."
echo "2. يجب أن يكون لديك Node.js مثبتاً."
echo "3. يجب أن يكون التطبيق منشوراً على الإنترنت (لديه رابط https)."
echo ""

APP_URL="https://ais-pre-onwvyflreacnxpk3rfa2zc-746375125740.europe-west2.run.app"

echo "الرابط الحالي للتطبيق هو: $APP_URL"
echo "إذا كنت ترغب في تغييره، قم بتعديل هذا الملف."
echo ""
echo "جاري تهيئة مشروع الأندرويد..."
echo "سيُطلب منك إدخال بعض المعلومات مثل كلمات المرور للمفاتيح (تذكرها جيداً)."
echo ""

# إنشاء مجلد للمشروع
mkdir -p android-app
cd android-app

# تشغيل Bubblewrap لتهيئة المشروع وبنائه
npx @bubblewrap/cli init --manifest="$APP_URL/manifest.json"

echo ""
echo "تم تهيئة المشروع بنجاح!"
echo "جاري بناء ملف الـ APK..."
echo ""

npx @bubblewrap/cli build

echo ""
echo "================================================="
echo "تم الانتهاء! ستجد ملف الـ APK (app-release-signed.apk) جاهزاً للتثبيت في مجلد android-app"
echo "================================================="
