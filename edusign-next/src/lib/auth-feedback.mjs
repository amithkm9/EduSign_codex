/** Provider messages can expose implementation details; use stable French copy. */
export function authErrorMessage(error) {
  const code = error?.code;
  if (code === "invalid_credentials")
    return "L’adresse e-mail ou le mot de passe est incorrect.";
  if (code === "email_not_confirmed")
    return "Confirmez votre adresse e-mail avant de vous connecter. Consultez aussi vos courriers indésirables.";
  if (
    [
      "over_request_rate_limit",
      "over_email_send_rate_limit",
      "over_sms_send_rate_limit",
    ].includes(code) ||
    error?.status === 429
  )
    return "Trop de tentatives. Patientez quelques instants avant de réessayer.";
  if (["weak_password", "same_password"].includes(code))
    return "Choisissez un nouveau mot de passe avec au moins 8 caractères, une majuscule, une minuscule et un chiffre.";
  if (code === "user_already_exists")
    return "Cette inscription ne peut pas être finalisée. Essayez de vous connecter ou de réinitialiser votre mot de passe.";
  if (
    code === "email_address_not_authorized" ||
    code === "email_address_invalid"
  )
    return "L’envoi d’e-mails est indisponible pour cette adresse. Réessayez plus tard ou utilisez votre compte de démonstration.";
  if (
    ["otp_expired", "flow_state_expired", "flow_state_not_found"].includes(code)
  )
    return "Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.";
  return "Le service est momentanément indisponible. Réessayez dans quelques instants.";
}
