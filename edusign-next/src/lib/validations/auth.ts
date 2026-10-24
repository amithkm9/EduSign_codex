import { z } from "zod";

const password = z
  .string()
  .min(8, "Au moins 8 caractères")
  .regex(/[a-z]/, "Ajoutez une lettre minuscule")
  .regex(/[A-Z]/, "Ajoutez une lettre majuscule")
  .regex(/[0-9]/, "Ajoutez un chiffre");

export const loginSchema = z.object({
  email: z.string().trim().email("Saisissez une adresse e-mail valide"),
  password: z.string().min(1, "Saisissez votre mot de passe"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Saisissez au moins 2 caractères").max(100),
    email: z.string().trim().email("Saisissez une adresse e-mail valide"),
    phone: z
      .string()
      .regex(
        /^\+?[\d\s\-()]{10,15}$/,
        "Saisissez un numéro de téléphone valide",
      )
      .optional()
      .or(z.literal("")),
    userType: z
      .enum(["parent", "educator", "student", "other"])
      .default("parent"),
    ageGroup: z.enum(["1-4", "5-10", "15+"]).optional().or(z.literal("")),
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const emailSchema = z.object({
  email: z.string().trim().email("Saisissez une adresse e-mail valide"),
});

export const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
