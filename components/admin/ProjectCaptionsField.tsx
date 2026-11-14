import { TextareaField } from "@/components/ui/FormControls";
export function ProjectCaptionsField({ index, value, onChange }: { index: number; value: string; onChange: (value: string) => void }) {
  return <TextareaField id={`media-${index}-captions`} label="زیرنویس ویدیو (WebVTT)" value={value} maxLength={30000} rows={5} help="برای ویدیوی دارای گفتار، متن زیرنویس زمان‌بندی‌شده را وارد کنید؛ خط نخست باید WEBVTT باشد." dir="ltr" onChange={event => onChange(event.target.value)} />;
}
