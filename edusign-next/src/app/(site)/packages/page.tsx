import Link from "next/link";
import {
  ArrowRight,
  Check,
  HeartHandshake,
  Sparkles,
  Sprout,
  CircleHelp,
  BookOpen,
  School,
  Mail,
} from "lucide-react";
import { T } from "@/components/i18n/locale-provider";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/server";
import { getUser } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: t("Nos formules"),
    description: t("Trois façons de découvrir la LSF, à votre rythme."),
  };
}
const plans = [
  {
    id: "free",
    name: "Découverte",
    label: "VERSION GRATUITE",
    icon: Sprout,
    tint: "bg-secondary",
    price: "0 €",
    cadence: "Pour commencer, tout simplement",
    description:
      "Vos premiers signes, vos premières découvertes, et le plaisir d’apprendre ensemble.",
    features: [
      "Deux ateliers vidéo LSF avec quiz",
      "Activités à essayer en famille",
      "Un carnet de pratique avec votre compte",
      "Interface en français et en anglais",
    ],
    available: true,
  },
  {
    id: "personal",
    name: "Tuteur personnel",
    label: "UN ACCOMPAGNEMENT INDIVIDUEL",
    icon: HeartHandshake,
    tint: "bg-muted",
    price: "À venir",
    cadence: "Tarif et modalités à confirmer",
    description:
      "Un projet d’accompagnement individuel pour poser vos questions et avancer avec un tuteur.",
    features: [
      "Format de tutorat en préparation",
      "Objectifs adaptés à vos besoins",
      "Temps d’échange et conseils de pratique",
      "Réservation disponible au lancement",
    ],
    available: false,
  },
  {
    id: "subscription",
    name: "Standard",
    label: "POUR ALLER PLUS LOIN",
    icon: Sparkles,
    tint: "bg-secondary",
    price: "À venir",
    cadence: "Tarif et fréquence à confirmer",
    description:
      "Une formule en préparation pour accompagner une pratique régulière, au fil des découvertes.",
    features: [
      "Contenu et avantages en cours de définition",
      "Un parcours pensé pour la régularité",
      "Modalités présentées avant toute inscription",
      "Aucun engagement ni paiement aujourd’hui",
    ],
    available: false,
  },
];
export default async function Packages() {
  const user = await getUser();
  const locale = await getLocale();
  const price = (value: string | undefined) =>
    value &&
    /^\d+(?:[.,]\d{1,2})?$/.test(value) &&
    Number(value.replace(",", ".")) > 0
      ? new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
          style: "currency",
          currency: "EUR",
        }).format(Number(value.replace(",", ".")))
      : "Tarif à confirmer";
  const email = (
    process.env.EDUSIGN_SCHOOLS_EMAIL || "amithkm9@gmail.com"
  ).trim();
  const schoolEmail =
    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  const monthlyPlans = plans
    .map((plan) => ({
      ...plan,
      price:
        plan.id === "free"
          ? plan.price
          : price(
              plan.id === "personal"
                ? process.env.EDUSIGN_TUTOR_MONTHLY_EUR || "99"
                : process.env.EDUSIGN_STANDARD_MONTHLY_EUR,
            ),
      cadence:
        plan.id === "free" ? plan.cadence : "Par mois · offre en préparation",
    }))
    .sort(
      (a, b) =>
        ["free", "subscription", "personal"].indexOf(a.id) -
        ["free", "subscription", "personal"].indexOf(b.id),
    );
  return (
    <div className="container py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">
          <T text="À CHACUN SA FAÇON D’APPRENDRE" />
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          <T text="Un petit pas aujourd’hui." />
          <br />
          <span className="text-primary">
            <T text="Un chemin à votre mesure." />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          <T text="Commencez gratuitement. Découvrez aussi les accompagnements que nous préparons pour la suite." />
        </p>
      </header>
      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {monthlyPlans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col rounded-[1.8rem] border bg-white p-7 sm:p-8 ${plan.available ? "border-primary/45 shadow-[0_12px_40px_-20px_rgba(36,54,107,.25)]" : "border-border"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`grid size-14 place-items-center rounded-2xl ${plan.tint}`}
              >
                <plan.icon
                  aria-hidden
                  className="size-7 text-primary"
                  strokeWidth={1.6}
                />
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${plan.available ? "bg-secondary text-primary" : "bg-background text-muted-foreground"}`}
              >
                <T
                  text={
                    plan.available ? "Disponible maintenant" : "En préparation"
                  }
                />
              </span>
            </div>
            <p className="mt-7 text-[10px] font-bold tracking-widest text-muted-foreground">
              <T text={plan.label} />
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              <T text={plan.name} />
            </h2>
            <p className="mt-3 min-h-20 text-sm leading-relaxed text-muted-foreground">
              <T text={plan.description} />
            </p>
            <div className="my-6 border-y border-border py-5">
              <p
                className={`font-semibold tracking-tight ${plan.price === "Tarif à confirmer" ? "text-2xl" : "text-4xl"}`}
              >
                <T text={plan.price} />
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <T text={plan.cadence} />
              </p>
            </div>
            <ul className="mb-8 flex-1 space-y-4">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 text-sm leading-relaxed"
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  <T text={feature} />
                </li>
              ))}
            </ul>
            {plan.available ? (
              <Link
                href={user ? "/courses" : "/register?redirectTo=%2Fcourses"}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90"
              >
                <T
                  text={user ? "Explorer les leçons" : "Commencer gratuitement"}
                />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : (
              <Link
                href="#upcoming-plans"
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-primary hover:bg-secondary"
              >
                <T text="En savoir plus sur le lancement" />
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </article>
        ))}
      </div>
      <section
        id="schools"
        className="mt-10 grid gap-7 rounded-[2rem] bg-primary p-7 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center"
      >
        <div>
          <School aria-hidden className="size-8" />
          <p className="mt-4 text-xs font-bold tracking-wider">
            <T text="ÉCOLES ET ÉTABLISSEMENTS" />
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            <T text="Apprendre ensemble, à l’échelle d’une classe." />
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
            <T text="Parlons de vos élèves, de votre calendrier et de l’accompagnement souhaité. Une formule adaptée à votre établissement, sur devis." />
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-foreground">
          <p className="font-bold">
            <T text="Informations et devis" />
          </p>
          {schoolEmail ? (
            <a
              href={`mailto:${schoolEmail}`}
              className="mt-4 inline-flex min-h-11 items-center gap-2 break-all text-sm font-semibold text-primary"
            >
              <Mail className="size-4 shrink-0" />
              {schoolEmail}
            </a>
          ) : (
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              <T text="Les coordonnées de notre contact écoles seront publiées prochainement." />
            </p>
          )}
        </div>
      </section>
      <section
        id="upcoming-plans"
        className="mt-10 scroll-mt-28 rounded-3xl bg-secondary/60 p-7 sm:p-9"
      >
        <div className="flex max-w-3xl gap-4">
          <CircleHelp
            aria-hidden
            className="mt-1 size-6 shrink-0 text-primary"
          />
          <div>
            <h2 className="text-xl font-bold">
              <T text="Et les formules à venir ?" />
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <T text="Les formules payantes sont en préparation. Le tarif affiché pour le tuteur personnel est mensuel ; la réservation et le paiement ne sont pas encore ouverts." />
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-16 max-w-3xl">
        <p className="eyebrow">
          <T text="TOUT SIMPLEMENT" />
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          <T text="Avant de vous lancer." />
        </h2>
        <div className="mt-6 divide-y divide-border">
          {[
            [
              "Faut-il un compte pour regarder les leçons ?",
              "Non. Les leçons et les activités sont accessibles librement. Un compte gratuit permet de garder une trace de votre pratique.",
            ],
            [
              "Le tuteur personnel est-il l’assistant IA ?",
              "L’assistant IA déjà présent aide à trouver une ressource ou une idée d’activité. Le projet de tutorat personnel est une offre distincte, dont les modalités restent à préciser.",
            ],
            [
              "Dois-je ajouter une carte bancaire ?",
              "Non. Aucune carte bancaire n’est demandée pour créer votre compte ou explorer les ateliers actuels.",
            ],
          ].map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer py-1 font-semibold marker:text-primary">
                <T text={question} />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <T text={answer} />
              </p>
            </details>
          ))}
        </div>
        <Link
          href="/courses"
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"
        >
          <BookOpen aria-hidden className="size-4" />
          <T text="Découvrir les ateliers gratuits" />
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </section>
    </div>
  );
}
