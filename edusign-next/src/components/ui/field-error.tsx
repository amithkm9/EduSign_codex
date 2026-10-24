import { T } from "@/components/i18n/locale-provider";
/** Renders the first validation error for a field, if any. */
export function FieldError({ errors, id }: { errors?: string[]; id?: string }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1 text-xs text-destructive">
      <T text={errors[0]} />
    </p>
  );
}
