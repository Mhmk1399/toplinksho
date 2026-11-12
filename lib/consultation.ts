export const consultationSubjects = ["طراحی سایت", "شبکه‌های اجتماعی", "طراحی کمپین تبلیغاتی", "تبلیغات گوگل ادز", "برندینگ", "طراحی گرافیکی", "تولید محتوا", "تدوین ویدیو", "بهینه‌سازی سئو", "تبلیغات آنلاین", "مشاوره و انتخاب مسیر", "هوش مصنوعی و اتوماسیون", "امنیت وب‌سایت", "توسعه نرم‌افزار اختصاصی", "توسعه وب", "توسعه اپلیکیشن", "توسعه فروشگاه اینترنتی", "طراحی رابط و تجربه کاربری"] as const;
export type ConsultationField = "name" | "phone" | "subject" | "description" | "website";
export type ConsultationValues = Record<ConsultationField, string>;
export type FieldErrors = Partial<Record<ConsultationField, string>>;
export const emptyConsultation: ConsultationValues = { name: "", phone: "", subject: "", description: "", website: "" };

export const requestStatuses = { new: "جدید", reviewing: "در حال بررسی", contacted: "تماس گرفته شده", completed: "انجام شده", archived: "بایگانی" } as const;
export type RequestStatus = keyof typeof requestStatuses;
export const emailStatuses = { pending: "در انتظار ارسال", sending: "در حال ارسال", sent: "ارسال شده", failed: "ارسال ناموفق", unconfigured: "منتظر اتصال ایمیل" } as const;
export type EmailStatus = keyof typeof emailStatuses;

export function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function validateConsultation(input: unknown): { values: ConsultationValues; errors: FieldErrors } {
  const record = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const values = { ...emptyConsultation };
  for (const key of Object.keys(values) as ConsultationField[]) values[key] = typeof record[key] === "string" ? record[key].trim() : "";
  const errors: FieldErrors = {};
  if (values.name.length < 2 || values.name.length > 100) errors.name = "نام و نام خانوادگی را بین ۲ تا ۱۰۰ حرف وارد کنید.";
  const phone = normalizeDigits(values.phone);
  values.phone = phone.replace(/[\s()-]/g, "").replace(/^0098/, "+98");
  if (!/^[+\d\s()-]+$/.test(phone) || !/^(?:0\d{9,13}|\+[1-9]\d{7,14})$/.test(values.phone)) errors.phone = "شماره تماس معتبر وارد کنید؛ مانند ۰۹۱۲۲۱۹۱۵۴۹.";
  if (!(consultationSubjects as readonly string[]).includes(values.subject)) errors.subject = "زمینهٔ مشاوره را انتخاب کنید.";
  if (values.description.length > 3000) errors.description = "توضیحات باید حداکثر ۳۰۰۰ حرف باشد.";
  if (values.website.length > 250 || /[\r\n\u0000-\u001f]/.test(values.website)) errors.website = "آدرس سایت یا شبکهٔ اجتماعی را کوتاه‌تر و در یک خط بنویسید.";
  return { values, errors };
}

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && Object.hasOwn(requestStatuses, value);
}

export function formatDate(value: number) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(value));
}
