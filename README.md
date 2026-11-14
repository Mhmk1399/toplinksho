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
- `/services/[...slug]` — قالب مشترک جزئیات خدمات و زیرخدمات
- `/portfolio` و `/portfolio/[slug]` — فهرست نمونه‌کارها و جزئیات پروژه
- `/admin` — مدیریت درخواست‌ها
- `/admin/settings` — وضعیت و بررسی اتصال ایمیل
- `/admin/projects` — فهرست، ساخت، ویرایش و انتشار پروژه‌ها

درخواست‌ها و حساب‌های کاربران با Mongoose در MongoDB ذخیره می‌شوند. `MONGODB_URI` را فقط در محیط سرور تنظیم کنید. اعلان SMTP مستقل از ثبت درخواست است. نشست‌ها و محدودیت درخواست‌ها نیز در MongoDB مشترک نگهداری می‌شوند.

## بررسی

```powershell
npm run lint
npx tsc --noEmit
npm run build
node scripts/smoke-test.mjs
npm run test:backend
npm run test:projects
npm run test:seo
npm run test:e2e
```

تست‌های بک‌اند از MongoDB موقت و SMTP با TLS محلی و اطلاعات ساختگی استفاده می‌کنند؛ ایمیل واقعی ارسال نمی‌شود. تست مرورگر از Chrome نصب‌شده استفاده می‌کند. گزارش‌ها در `artifacts` ذخیره می‌شوند.

هویت بصری، نگاشت رنگ‌ها و قرارداد رفتار در [DESIGN.md](DESIGN.md) و [UX-CONTRACT.md](UX-CONTRACT.md) ثبت شده‌اند. سئو و PWA از دادهٔ مشترک صفحات ساخته می‌شوند. برای دامنهٔ نهایی HTTPS، `APP_URL` و `SITE_INDEXABLE=true` را پیش از build تنظیم کنید؛ پیش‌نمایش به‌طور پیش‌فرض noindex است. نصب PWA، کش فایل‌های عمومی و صفحهٔ آفلاین در build تولید فعال‌اند. [راهنمای راه‌اندازی](SETUP.md) جزئیات را توضیح می‌دهد.

## محتوای صفحهٔ اصلی

نسخهٔ فارسی و خلاصهٔ هوم chetahNova از `content/home.fa.json` خوانده می‌شود؛ متن صفحه، متادیتا، FAQ و کارت اشتراک‌گذاری از همین داده تولید می‌شوند. ترتیب بخش‌ها: هیرو/سه خدمت، ابزارهای هوش مصنوعی، یک فرم مشاوره، مراحل همکاری، FAQ و تماس.

خروجی انگلیسی با فایل‌های منبع و هش آن‌ها در `content/source/cheetahnova-home.en.json` است. برای استخراج مجدد، `node scripts/extract-cheetahnova-home.mjs D:/Next/chetahNova` را اجرا کنید. این ابزار فقط فایل‌های مشخص‌شده را می‌خواند و هیچ کدی از پروژهٔ مرجع اجرا یا ویرایش نمی‌کند. آمار تأییدنشدهٔ منبع در نسخهٔ نمایشی منتشر نمی‌شود.

## صفحات و تم

بخش نمونه‌کارها از `/admin/projects` مدیریت می‌شود؛ پروژهٔ جدید، ویرایش، پیش‌نمایش خصوصی، انتشار و بایگانی دارد. مسیر عمومی `/portfolio` و جزئیات `/portfolio/[slug]` است. محتوا شامل معرفی، خدمات/زیرخدمات مرتبط، جلد و گالری، تصاویر و ویدیو، پوستر، زیرنویس WebVTT، شرح نیاز و اجرا، دستاوردها، بخش‌های دلخواه، FAQ، اطلاعات کارفرما و تنظیمات سئو است. محتوای صفحهٔ فهرست در `content/portfolio.fa.json` و اطلاعات هر پروژه در مدل `Project` نگه‌داری می‌شود.

در محیط نهایی، `APP_URL` و تنظیم ایندکس در build و زمان اجرا باید یکسان باشند تا صفحات ایستا، ISR و صفحات داینامیک نشانی اصلی یکسان داشته باشند. تست مرورگر عمداً روی سرور محلی جدا اجرا می‌شود؛ تست‌های مستقل سئو تنظیم تولید و سایت‌مپ دیتابیس را بررسی می‌کنند.

رسانه‌ها در GridFS همان اتصال `MONGODB_URI` و دیتابیس فعلی ذخیره می‌شوند؛ سرویس یا کلید اضافی لازم نیست. پیش از آپلود، پیش‌نویس را ذخیره کنید. تصاویر PNG/JPEG/WebP حداکثر ۸ MiB و ویدیوهای MP4/WebM حداکثر ۸۰ MiB هستند؛ هر پروژه تا ۳۲ فایل دارد. تصاویر حداکثر ۲۰۰۰ پیکسل و WebP می‌شوند؛ ویدیو ترنسکد نمی‌شود و باید کدک قابل پخش در مرورگر داشته باشد. برای ویدیوهای گفتاری، زیرنویس زمان‌بندی‌شدهٔ WebVTT را در فرم وارد کنید. سرور Node، فضای MongoDB و سقف بدنه/زمان درخواست میزبان یا reverse proxy باید اندازهٔ فایل انتخابی را پشتیبانی کنند؛ آپلود بزرگ از محدودیت میزبان عبور نمی‌کند. Sharp در وابستگی‌های زمان اجرا قرار دارد.

فقط پروژهٔ منتشرشده وارد فهرست عمومی، صفحات خدمات مرتبط و گروه‌های بالادستی، متادیتا، اسکیما و سایت‌مپ می‌شود. نشانی پس از اولین انتشار ثابت است؛ بایگانی، نمایش عمومی را قطع می‌کند و قابل بازگردانی است. انتشار/ویرایش صفحات خدمات را باطل می‌کند و ISR یک‌دقیقه‌ای هم فعال است. فایل‌های بلااستفاده از کتابخانه با تأیید صریح حذف می‌شوند؛ فایل متصل به نسخهٔ ذخیره‌شده حذف نمی‌شود. صفحهٔ خصوصی پیش‌نمایش از کش و ایندکس خارج است. HTML نمونه‌کارها وارد کش آفلاین نمی‌شود تا انتشار و بایگانی نیاز به انتشار نسخهٔ جدید PWA نداشته باشد.

تصاویر اختصاصی کارت‌های فعال در `content/card-artwork.fa.json` نگاشت می‌شوند: کلیدهای `route:` برای معرفی خدمات، `fit:` برای کاربرد، `deliverable:` برای خروجی‌ها و `ai:` و `section:` برای بخش‌های دیگر هستند. `FeatureCard` از آدرس مقصد یا پراپس `artworkKey` تصویر مرتبط را انتخاب می‌کند. فهرست موضوع‌ها در `artifacts/card-artwork-inventory.json` و پرامپت و منبع هر تصویر در `artifacts/card-artwork-generation` ثبت می‌شوند؛ فایل‌های PNG شفاف نهایی در `public/images/cards` هستند. نام فایل شامل اثر انگشت محتواست تا نسخهٔ تازه در کش با تصویر قبلی اشتباه نشود.

`node --import ./scripts/register-aliases.mjs scripts/inventory-card-artwork.mjs` فهرست موضوع‌ها را استخراج می‌کند. پس از تولید با ابزار داخلی imagegen، `node scripts/install-card-artwork.mjs` شفافیت و یکتایی را بررسی می‌کند، PNGهای با اندازهٔ محدود می‌سازد و نگاشت را به‌روز می‌کند. فایل `content/menu-artwork.generated.json` خروجی کوچکِ چهار تصویر منو است؛ کاتالوگ کامل تصاویر در سمت سرور باقی می‌ماند. پس از build، `node scripts/card-artwork-review.mjs` تمام صفحات عمومی را برای تصویر گمشده، نگاشت نادرست یا تکرار در همان صفحه بررسی می‌کند و شیت‌های پیش‌نمایش می‌سازد.

`theme/theme.json` تنها فایل قابل ویرایش برای رنگ‌های رابط است. `npm run theme:generate` خروجی CSS را تولید می‌کند؛ `npm run dev` تغییرات این فایل را خودکار دنبال می‌کند و build نیز تم را تولید می‌کند. فایل‌های `theme/generated.css` و `public/theme.css` خروجی هستند. رنگ تصاویر و لوگو متعلق به خود فایل‌های تصویری است.

دادهٔ خدمات در `content/services.fa.json`، صفحات اصلی در `content/pages.fa.json` و منو در `content/navigation.fa.json` قرار دارد. یک مسیر catch-all و قالب مشترک، صفحات گروه‌ها و تخصص‌ها را می‌سازند. متادیتا، FAQ، breadcrumb، sitemap، تصاویر اجتماعی و کش عمومی PWA از رجیستری واحد `lib/page-registry.ts` تولید می‌شوند.

برای متن کامل صفحات، `heroDescription` توضیح هیرو و `bodyParagraphs` پاراگراف‌های معرفی هستند؛ `processDescription` هم توضیح مراحل خدمات است. متن کوتاه `description` برای کارت‌ها و متادیتا حفظ شده و عنوان‌های `title` افزایش طول ندارند. پنج خدمت قدیمی از بخش `legacyEditorial` همان JSON خوانده می‌شوند. در صفحهٔ اصلی، متن‌ها در `content/home.fa.json` هستند. `NarrativeCopy` و `PageOverview` متن‌ها را روی سرور و در جریان معمول صفحه نمایش می‌دهند و جاوااسکریپت جدیدی به مرورگر اضافه نمی‌کنند. گزارش مقایسهٔ متن، ثابت‌ماندن H1 و توضیح کارت‌های ۶۱ صفحه با `node scripts/page-copy-review.mjs` ساخته می‌شود؛ فایل مبنا در `artifacts/page-copy-baseline.json` متعلق به پیش از همین بازنویسی است.

نور پشت تصاویر کارت‌ها در `components/ui/feature-card.css` با دو گرادیان شعاعی نرم و ثابت ساخته می‌شود. شکل‌های موجی با مرز تیز حذف شده‌اند و عکس PNG بدون ماسک و blend روی آن قرار می‌گیرد؛ این افکت فیلتر blur، انیمیشن یا درخواست تصویر جدید ندارد.

منبع نوبار و صفحات chetahNova با مسیر و هش فایل در `content/source/cheetahnova-site.en.json` ثبت شده است. در منبع، وبلاگ نوشتهٔ فعال ندارد؛ نمونه‌های پروژه نیز «پیشنهاد سامانه» هستند. قیمت‌های دلاری به قیمت محلی تبدیل نشده‌اند و تعرفه‌ها برآوردی/استعلامی‌اند؛ متن هر بسته از JSON قابل تنظیم است.

قاب مشترک تصاویر کارت‌ها در `components/shared/CardVisual.tsx` و نگاشت تصاویر در `content/visuals.fa.json` است. چهار تصویر خدمات با ابزار داخلی imagegen از پس‌زمینه جدا شده‌اند و فایل‌های نهایی PNG با آلفای واقعی در `public/images/services` هستند. پرامپت‌ها و مسیر نسخه‌های شفاف در `artifacts/transparent-artwork-source.json` ثبت شده‌اند؛ `artifacts/service-artwork.json` فقط سابقهٔ نسخهٔ قدیمی است. تصاویر هیرو و نسخه‌های موبایل نیز PNG شفاف دارند. `next/image` اندازه و فرمت انتقال را بهینه می‌کند و شفافیت حفظ می‌شود؛ PNG اصلی همچنان قابل استفاده و دانلود است. برای بررسی هدر PNG، آلفا و لبه‌های شفاف، `npm run test:artwork` را اجرا کنید. بردکرامب مشترک پیش از هیرو قرار دارد و اسکرول افقی موبایل آن فقط نوار اسکرول خودش را مخفی می‌کند.

برای بازبینی تصویری، `node scripts/site-visual-review.mjs` را پس از build اجرا کنید. بررسی اختیاری Lighthouse با `npx --yes lighthouse@13.6.0 --version` و سپس `node scripts/lighthouse-review.mjs` انجام می‌شود؛ ابزار در کش npm نصب می‌شود و وابستگی پروژه نیست. گزارش موبایل محلی در `artifacts/lighthouse-summary.json` است. noindex پیش‌نمایش عمداً حفظ می‌شود و امتیاز این محیط معادل دادهٔ کاربران واقعی یا تضمین رتبهٔ گوگل نیست.

کارت مرجع در `components/ui/FeatureCard.tsx` و استایل مشترک آن در `components/ui/feature-card.css` است. برای تغییر محتوا، پراپس‌ها یا دادهٔ JSON را تنظیم کنید:

```tsx
<FeatureCard
  title="توسعه اپلیکیشن"
  description="اپلیکیشن وب و موبایل متناسب با نیاز کاربران کسب‌وکار شما."
  image="/images/services/development.png"
  imageAlt="مرورگر و تلفن همراه شیشه‌ای"
  category="توسعه"
  href="/services/development/app-development"
/>
```

با `backgroundImage` می‌توانید عکس دلخواه پشت تصویر اصلی قرار دهید؛ در حالت پیش‌فرض موج‌ها و نور با CSS/SVG ثابت ساخته می‌شوند. `children` برای زیرخدمات یا امکانات و `footer` برای محتوای تکمیلی است. رنگ‌ها از `theme/theme.json` می‌آیند. کامپوننت `CardGrid` چینش دسکتاپ و ردیف قابل‌سوایپ موبایل را یکپارچه می‌کند. پس از build، `node scripts/artwork-delivery-review.mjs` آلفای نسخهٔ تحویلی، دانلود نشدن هم‌زمان دو تصویر هیرو و اندازهٔ خروجی را در موبایل عادی و DPR 3 بررسی می‌کند؛ گزارش در `artifacts/transparent-artwork-delivery.json` است.

دیزاین نوری هیرو در `components/shared/HeroBackdrop.tsx` و استایل‌های `hero-stage--neon` قرار دارد. مدارها و موج پایین، SVG ثابت هستند و دانلود تصویر یا کتابخانهٔ اضافه ندارند. `HeroArt` روی سرور ساخته می‌شود؛ `HeroMotion` فقط کنترل توقف/اجرای حرکت المان اصلی را بر عهده دارد. اندازه‌ها و رفتار موبایل از `PageHero` مشترک می‌آیند. برای بررسی چهار هیروی اصلی در موبایل و دسکتاپ، `node scripts/hero-review.mjs` را پس از build اجرا کنید؛ گزارش و تصاویر در `artifacts/hero-design-review.json` ثبت می‌شوند.

گزارش تغییرات هیرو و اندازه‌گیری قبل/بعد در `artifacts/hero-performance-review.json` است. تست‌های رفتاری و دسترس‌پذیری موفق‌اند؛ امتیاز عملکرد Lighthouse در بارگذاری نخست هوم روی شبکهٔ کند هنوز جای بهبود دارد. برای مقایسهٔ روش اندازه‌گیری، `LIGHTHOUSE_THROTTLING=devtools` محدودسازی واقعی CPU/شبکه را اعمال می‌کند و گزارش جداگانه با پسوند `-applied` می‌نویسد؛ روش پیش‌فرض مدل شبیه‌سازی Lighthouse است. نتایج هر دو آزمایشگاهی‌اند.

مگامنو در `components/layout/ServiceMenu.tsx` از `content/navigation.fa.json` ساخته می‌شود؛ عنوان کوتاه، توضیح، ترتیب و لینک هر دسته از همان JSON قابل تغییر است. دسکتاپ سه ستون خدمات و کارت رشد را در یک ردیف نشان می‌دهد؛ موبایل سه دستهٔ تصویری بازشونده دارد. `Ctrl/Cmd+K` جست‌وجوی دسکتاپ را باز می‌کند. منابع تصاویر، PNG شفاف هستند و فقط هنگام نمایش منو با اندازهٔ بهینه بارگیری می‌شوند؛ پیش‌واکشی لینک‌های منو غیرفعال است. ماسک و blend برای پنهان‌کردن پس‌زمینهٔ تصویر استفاده نمی‌شود. رنگ‌ها از تم مشترک می‌آیند و جلوه‌های شیشه‌ای منو انیمیشن مداوم یا blur ندارند. برای تصاویر و بررسی ابعاد، `node scripts/menu-review.mjs` را پس از build اجرا کنید.

Service workflows use `components/services/ServiceProcess.tsx` with route JSON props and `service-process.css`. Transparent icon sources and prompts are recorded in `artifacts/process-artwork-generation.json`. `ServiceEntrance` progressively animates shared service sections once, with reduced-motion and constrained-device opt-outs; SSR content stays visible without JavaScript. Run `npx playwright test tests/service-workflow.spec.ts` for responsive, accessibility and motion checks.

### سلکت مشترک

تمام سلکت‌ها از `components/ui/Select.tsx` می‌آیند؛ از `FormControls` هم قابل import هستند. گزینه‌ها به شکل `{ value, label, disabled?, hidden?, title? }` یا گروه `{ label, options, disabled? }` ارسال می‌شوند. مقدارها پس از تبدیل به رشته باید یکتا باشند. برای فرم‌های کلاینت:

```tsx
<Select
  id="service"
  name="service"
  label="خدمت مورد نیاز"
  options={services.map(item => ({ value: item.id, label: item.title }))}
  value={service}
  onValueChange={setService}
  placeholder="یک خدمت انتخاب کنید"
  required
  error={errors.service}
  help="خدمت متناسب با نیازتان را انتخاب کنید."
/>
```

در فیلترهای سمت سرور، `defaultValue` و `name` را با فرم `method="get"` استفاده کنید؛ نیازی به handler نیست. کلید فیلد را به مقدار ثبت‌شده در URL وابسته کنید تا بازگشت و جلو رفتن مرورگر مقدار را درست نگه دارد. `onChange` بومی هم پشتیبانی می‌شود؛ اگر هر دو callback داده شوند، ابتدا `onChange` و سپس `onValueChange` فراخوانی می‌شود. خروجی انتخاب تکی رشته و خروجی `multiple` آرایه‌ای از رشته‌هاست. `multiple` به‌صورت فهرست بومی و بدون فلش نمایش داده می‌شود.

ورودی‌های دیگر: `placeholderDisabled`، `loading`، `loadingText`، `emptyText`، `disabled`، `required`، `dir`، `ref`، `form`، `autoComplete`، `size` برای تعداد ردیف‌های فهرست و بقیهٔ ویژگی‌های استاندارد select. برای ظاهر، `className` و `style` روی کنترل و `containerClassName`، `labelClassName`، `messageClassName` و `hideLabel` روی پوسته در دسترس‌اند. منوی بازشونده را مرورگر یا سیستم‌عامل مدیریت می‌کند؛ جست‌وجوی تایپی و کنترل کیبورد هم بومی هستند. این کامپوننت وابستگی یا مرز کلاینت تازه‌ای اضافه نمی‌کند. آزمون‌های مرتبط در `tests/select.spec.ts` هستند و `test:migration` استفاده از select/option خارج از این کامپوننت را رد می‌کند.
