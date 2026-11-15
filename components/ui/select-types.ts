import type { ChangeEvent, ChangeEventHandler, Ref, SelectHTMLAttributes } from "react";
import type { FieldMeta, FieldPresentation } from "@/components/ui/FieldShell";
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

