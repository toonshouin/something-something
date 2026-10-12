import type { Locale } from './dates';

const en = {
  resume: 'Resume', print: 'Print / Save PDF', source: 'Source', language: 'Language',
  printHelp: 'Choose “Customize print” to exclude sections or individual entries from your printed CV.',
  customize: 'Customize print', done: 'Finish customizing', include: 'Include in print', excluded: 'Excluded from print',
  skip: 'Skip to CV', coursework: 'Relevant coursework', issued: 'Issued', expires: 'Expires',
  valid: 'Valid', expired: 'Expired', unavailable: 'Expiration date unavailable', notYetValid: 'Not yet valid',
  verify: 'Verify certificate', portal: 'Open verification portal', verification: 'Verification link',
  code: 'Verification code', viewPdf: 'View certificate (PDF)', downloadPdf: 'Download PDF', detail: 'Credential details',
  issuer: 'Issuer', type: 'Credential type', profilePicture: 'Profile photo',
  theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark'
};
const th: Record<keyof typeof en, string> = {
  resume: 'ประวัติส่วนตัว', print: 'พิมพ์ / บันทึก PDF', source: 'ซอร์สโค้ด', language: 'ภาษา',
  printHelp: 'เลือก “ปรับเนื้อหาที่พิมพ์” เพื่อเลือกส่วนหรือรายการที่ต้องการนำออกจาก CV ฉบับพิมพ์',
  customize: 'ปรับเนื้อหาที่พิมพ์', done: 'เสร็จสิ้นการปรับเนื้อหา', include: 'รวมในฉบับพิมพ์', excluded: 'ไม่รวมในฉบับพิมพ์',
  skip: 'ข้ามไปยัง CV', coursework: 'รายวิชาที่เกี่ยวข้อง', issued: 'วันที่ออก', expires: 'วันหมดอายุ',
  valid: 'ยังไม่หมดอายุ', expired: 'หมดอายุแล้ว', unavailable: 'ไม่มีข้อมูลวันหมดอายุ', notYetValid: 'ยังไม่ถึงวันที่มีผล',
  verify: 'ตรวจสอบใบรับรอง', portal: 'เปิดเว็บไซต์ตรวจสอบ', verification: 'ลิงก์ตรวจสอบ',
  code: 'รหัสตรวจสอบ', viewPdf: 'ดูใบรับรอง (PDF)', downloadPdf: 'ดาวน์โหลด PDF', detail: 'รายละเอียดใบรับรอง',
  issuer: 'ผู้ออกใบรับรอง', type: 'ประเภทใบรับรอง', profilePicture: 'รูปประจำตัว',
  theme: 'ธีม', system: 'ตามระบบ', light: 'สว่าง', dark: 'มืด'
};
export const messages = { en, th };
export const ui = (locale: string) => messages[locale === 'th' ? 'th' : 'en'];
export const localeOf = (value: string | null): Locale => value === 'th' ? 'th' : 'en';
