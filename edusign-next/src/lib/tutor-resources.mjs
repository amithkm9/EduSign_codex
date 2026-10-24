export function safeTutorResource(url) {
  return [
    "/learn/lsf-alphabet",
    "/learn/lsf-nombres",
    "/parents",
    "https://dico.elix-lsf.fr/",
  ].includes(url);
}
