"use client";
import { useLocale as useInterfaceLocale } from "@/components/i18n/locale-provider";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput(
  props: Omit<React.ComponentProps<typeof Input>, "type">,
) {
  const { t: _t } = useInterfaceLocale();

  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={_t(
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe",
        )}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-muted-foreground hover:text-primary"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
