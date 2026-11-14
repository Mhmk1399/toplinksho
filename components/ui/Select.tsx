import { ChevronDown } from "lucide-react";
import type {
  ChangeEvent,
  ChangeEventHandler,
  Ref,
  SelectHTMLAttributes,
} from "react";
import {
  FieldShell,
  fieldClass,
  type FieldMeta,
  type FieldPresentation,
} from "@/components/ui/FieldShell";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
  title?: string;
};
export type SelectOptionGroup = {
  label: string;
  options: readonly SelectOption[];
  disabled?: boolean;
};
type CommonProps = FieldMeta &
  FieldPresentation &
  Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "id" | "children" | "multiple" | "value" | "defaultValue" | "onChange"
  > & {
    id: string;
    options: readonly (SelectOption | SelectOptionGroup)[];
    placeholder?: string;
    placeholderDisabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    emptyText?: string;
    onChange?: ChangeEventHandler<HTMLSelectElement>;
    ref?: Ref<HTMLSelectElement>;
  };
export type SelectProps = CommonProps &
  (
    | {
        multiple?: false;
        value?: string | number;
        defaultValue?: string | number;
        onValueChange?: (
          value: string,
          event: ChangeEvent<HTMLSelectElement>,
        ) => void;
      }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onValueChange?: (
          values: string[],
          event: ChangeEvent<HTMLSelectElement>,
        ) => void;
      }
  );

/** Data-driven native select: server-renderable; no client bundle or popup dependency. */
export function Select(props: SelectProps) {
  const {
    id,
    label,
    options,
    error,
    help,
    placeholder,
    placeholderDisabled = !!props.required || !!props.multiple,
    loading = false,
    loadingText = "در حال دریافت گزینه‌ها…",
    emptyText = "گزینه‌ای موجود نیست",
    containerClassName,
    labelClassName,
    messageClassName,
    hideLabel,
    className = "",
    multiple,
    size,
    value,
    defaultValue,
    onChange,
    onValueChange,
    disabled,
    ...nativeProps
  } = props;
  const count = options.reduce(
    (total, option) =>
      total + ("options" in option ? option.options.length : 1),
    0,
  );
  const listbox = multiple || (size !== undefined && size > 1);
  const message = loading ? loadingText : help;
  const description =
    [
      ...new Set(
        [
          ...(nativeProps["aria-describedby"] || "").split(/\s+/),
          error || message ? `${id}-message` : "",
        ].filter(Boolean),
      ),
    ].join(" ") || undefined;
  const prompt =
    loading && !count
      ? loadingText
      : (placeholder ?? (!count ? emptyText : undefined));
  const renderOption = (option: SelectOption, index: number) => (
    <option
      key={`${option.value}-${index}`}
      value={option.value}
      disabled={option.disabled}
      hidden={option.hidden}
      title={option.title}
    >
      {option.label}
    </option>
  );
  // A server-rendered GET filter creates no event closure; client forms may opt into a value callback.
  const handleChange: ChangeEventHandler<HTMLSelectElement> | undefined =
    onValueChange
      ? (event) => {
          const selected = Array.from(
            event.currentTarget.selectedOptions,
            (option) => option.value,
          );
          const selectedValue = event.currentTarget.value;
          onChange?.(event);
          if (props.multiple) props.onValueChange?.(selected, event);
          else props.onValueChange?.(selectedValue, event);
        }
      : onChange;
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      help={message}
      containerClassName={containerClassName}
      labelClassName={labelClassName}
      messageClassName={messageClassName}
      hideLabel={hideLabel}
    >
      <div className="relative min-w-0" dir={nativeProps.dir}>
        <select
          {...nativeProps}
          id={id}
          data-ui="select"
          multiple={multiple}
          size={size ?? (multiple ? 5 : undefined)}
          value={value}
          defaultValue={
            defaultValue ??
            (value === undefined && prompt && !multiple ? "" : undefined)
          }
          onChange={handleChange}
          disabled={disabled || loading}
          aria-busy={loading || undefined}
          aria-invalid={error ? true : (nativeProps["aria-invalid"] ?? false)}
          aria-describedby={description}
          className={`${fieldClass} appearance-none bg-ink ${listbox ? "min-h-32 py-2" : "pe-11"} ${error ? "border-rose-300/60 focus:border-rose-300" : ""} ${className}`}
        >
          {prompt !== undefined && (
            <option
              value=""
              disabled={placeholderDisabled || loading || !count}
            >
              {prompt}
            </option>
          )}
          {options.map((option, index) =>
            "options" in option ? (
              <optgroup
                key={`${option.label}-${index}`}
                label={option.label}
                disabled={option.disabled}
              >
                {option.options.map(renderOption)}
              </optgroup>
            ) : (
              renderOption(option, index)
            ),
          )}
        </select>
        {!listbox && (
          <ChevronDown
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-accent"
          />
        )}
      </div>
    </FieldShell>
  );
}
