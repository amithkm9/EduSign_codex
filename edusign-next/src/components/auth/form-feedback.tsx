import { T } from "@/components/i18n/locale-provider";
import { CheckCircle2, CircleAlert } from "lucide-react";

export function FormFeedback({
  message,
  error = false,
}: {
  message?: string | null;
  error?: boolean;
}) {
  if (!message) return null;
  const Icon = error ? CircleAlert : CheckCircle2;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex gap-3 rounded-xl p-4 text-sm leading-relaxed ${error ? "bg-destructive/5 text-destructive" : "bg-secondary text-secondary-foreground"}`}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>
        <T text={message} />
      </p>
    </div>
  );
}
