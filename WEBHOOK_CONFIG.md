# تغییر آدرس وب‌هوک

برای تغییر آدرس وب‌هوک ارسال داده‌ها، فایل زیر را ویرایش کنید:

## فایل: `src/components/EngineeringForm.tsx`

در خط 9 فایل، متغیر `WEBHOOK_URL` را با آدرس جدید تغییر دهید:

```javascript
// Current URL
const WEBHOOK_URL = 'https://ai.alifarvardin.ir/webhook-test/SendToDb';

// Change to your new URL
const WEBHOOK_URL = 'https://your-new-webhook-url.com/endpoint';
```

## مشخصات ارسال داده‌ها

- **روش**: POST
- **فرمت**: multipart/form-data
- **Headers**: Content-Type: multipart/form-data (خودکار تنظیم می‌شود)

## فیلدهای ارسالی

- `firstName`: نام
- `lastName`: نام خانوادگی  
- `membershipNumber`: شماره عضویت
- `nationalId`: کد ملی
- `fileTitle`: عنوان فایل ارسالی (گزارش/طرح)
- `phoneNumber`: شماره تماس
- `cadastralCode`: کد کاداستر یا شناسایی
- `licenseNumber`: شماره پروانه (اختیاری)
- `description`: توضیحات
- `submittedAt`: تاریخ و ساعت ارسال (ISO format)
- `file_0`, `file_1`, ... : فایل‌های آپلود شده

## مثال Payload

```
firstName: "احمد"
lastName: "احمدی"
membershipNumber: "12345"
nationalId: "1234567890"
fileTitle: "گزارش"
phoneNumber: "09123456789"
cadastralCode: "ABC123"
licenseNumber: "LIC456"
description: "توضیحات تکمیلی"
submittedAt: "2024-01-15T10:30:00.000Z"
file_0: [File object]
file_1: [File object]
```