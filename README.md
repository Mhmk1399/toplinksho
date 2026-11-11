# TopLinkSho

سایت فارسی و راست‌به‌چپ تاپ لینک شو با Next.js، Tailwind CSS، فرم مشاوره، بک‌اند و پنل پیگیری درخواست‌ها.

## راه‌اندازی

Node.js نسخهٔ 22.18 یا جدیدتر لازم است.

```powershell
npm install
Copy-Item .env.example .env.local
npm run admin:hash-password
npm run dev
```

تنظیمات ورود مدیر و ایمیل را در فایل محیط وارد کنید. [راهنمای کامل راه‌اندازی](SETUP.md) شامل همهٔ متغیرها، نیازمندی میزبانی، پایگاه داده و تست‌ها است. اطلاعات محرمانه را در مخزن قرار ندهید.

## مسیرها

- `/` — صفحهٔ اصلی
- `/about-us` — درباره ما
- `/services` — خدمات
- `/contact` — تماس و فرم مشاوره
- `/services/[slug]` — نه صفحهٔ جزئیات خدمات
- `/admin` — مدیریت درخواست‌ها
- `/admin/settings` — وضعیت و بررسی اتصال ایمیل

درخواست‌ها و حساب‌های کاربران با Mongoose در MongoDB ذخیره می‌شوند. `MONGODB_URI` را فقط در محیط سرور تنظیم کنید. اعلان SMTP مستقل از ثبت درخواست است. نشست‌ها و محدودیت درخواست‌ها نیز در MongoDB مشترک نگهداری می‌شوند.

## بررسی

```powershell
npm run lint
npx tsc --noEmit
npm run build
node scripts/smoke-test.mjs
npm run test:backend
npm run test:seo
npm run test:e2e
```

تست‌های بک‌اند از MongoDB موقت و SMTP با TLS محلی و اطلاعات ساختگی استفاده می‌کنند؛ ایمیل واقعی ارسال نمی‌شود. تست مرورگر از Chrome نصب‌شده استفاده می‌کند. گزارش‌ها در `artifacts` ذخیره می‌شوند.

هویت بصری، نگاشت رنگ‌ها و قرارداد رفتار در [DESIGN.md](DESIGN.md) و [UX-CONTRACT.md](UX-CONTRACT.md) ثبت شده‌اند. سئو و PWA از دادهٔ مشترک صفحات ساخته می‌شوند. برای دامنهٔ نهایی HTTPS، `APP_URL` و `SITE_INDEXABLE=true` را پیش از build تنظیم کنید؛ پیش‌نمایش به‌طور پیش‌فرض noindex است. نصب PWA، کش فایل‌های عمومی و صفحهٔ آفلاین در build تولید فعال‌اند. [راهنمای راه‌اندازی](SETUP.md) جزئیات را توضیح می‌دهد.
