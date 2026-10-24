"use client";
import { T, useLocale } from "@/components/i18n/locale-provider";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Printer, Flame, Trophy, Clock, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { QuizTrendChart } from "./quiz-trend-chart";

type Insights = {
  overallSummary: string;
  strengthsAnalysis: string;
  areasForGrowth: string;
  achievements: string[];
  parentTips: string[];
  weeklyGoal: string;
  encouragement: string;
};

type Report = {
  student: {
    name: string;
    ageGroup: string | null;
    memberSince: string | null;
    currentStreak: number;
  };
  statistics: Record<string, number>;
  weeklyActivity: number[];
  videoProgress: {
    courseId: string;
    title: string;
    activeMs: number;
    durationMs: number;
    watchedMs: number;
    coverage: number;
    positionMs: number;
    lastWatchedAt: string | null;
  }[];
  quizTrend: { attempt: number; score: number; title: string }[];
  courseProgress: {
    title: string;
    progressPercentage: number;
    status: string;
  }[];
  aiInsights: Insights | null;
};

function fmtMinutes(m: number) {
  if (!m) return "0 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function ReportView() {
  const { locale, t } = useLocale();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/report?language=${locale}${refresh ? "&refresh=1" : ""}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.report) setReport(data.report);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !report) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        <T text={"Préparation du bilan…"} />{" "}
      </p>
    );
  }
  if (error || !report) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">
          <T text={"Le bilan est indisponible."} />
        </p>
        <Button className="mt-4" onClick={() => load()}>
          <T text={"Réessayer"} />{" "}
        </Button>
      </div>
    );
  }

  const s = report.statistics;
  const ai = report.aiInsights;
  const memberSince = report.student.memberSince
    ? new Date(report.student.memberSince).toLocaleDateString(
        locale === "fr" ? "fr-FR" : "en-GB",
        {
          month: "long",
          year: "numeric",
        },
      )
    : "—";

  const stats = [
    {
      icon: Trophy,
      label: "Activités déclarées terminées",
      value: String(s.totalCompleted),
    },
    {
      icon: Clock,
      label: "Temps de pratique enregistré",
      value: fmtMinutes(s.totalLearningTime),
    },
    {
      icon: Hand,
      label: "Activités en cours",
      value: String(s.coursesInProgress),
    },
    {
      icon: Flame,
      label: "Plus longue série",
      value: `${s.longestStreak} jours`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <T text={"Mon bilan de découvertes"} />
          </h1>
          <p className="text-sm text-muted-foreground">
            {report.student.name}
            <T
              text={
                report.student.ageGroup
                  ? ` · Groupe ${report.student.ageGroup}`
                  : ""
              }
            />
            <T text={" "} />
            <T text={"· Inscrit depuis"} /> {memberSince} · 🔥{" "}
            {report.student.currentStreak}
            <T text={" "} />
            <T text={"jours de suite"} />{" "}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <T text={" "} />
            <T text={"Actualiser"} />{" "}
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> <T text={"Imprimer / PDF"} />{" "}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <T
          text={
            "Ce bilan réunit vos activités, votre suivi vidéo et vos quiz de compréhension. Il ne mesure pas la maîtrise des signes."
          }
        />{" "}
      </p>
      {/* AI summary */}
      {ai && (
        <Card className="bg-secondary/40">
          <CardHeader>
            <CardTitle className="text-base">
              <T text={"En quelques mots"} />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            {ai.overallSummary}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <st.icon className="size-5" />
              </span>
              <div>
                <div className="text-xl font-bold">
                  <T text={st.value} />
                </div>
                <div className="text-xs text-muted-foreground">
                  <T text={st.label} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <T text="Le parcours vidéo" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            <T text="Le temps inclut les relectures. Le pourcentage compte chaque partie une seule fois. Ce suivi de lecture visible ne mesure pas l’attention de l’élève." />
          </p>
          {report.videoProgress.map((video) => (
            <div
              key={video.courseId}
              className="rounded-2xl border border-border p-4"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <h3 className="font-semibold">
                  <T text={video.title} />
                </h3>
                <strong className="text-primary">{video.coverage}%</strong>
              </div>
              <progress
                value={video.coverage}
                max={100}
                aria-label={t(video.title)}
                className="my-3 h-2 w-full accent-primary"
              />
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <p>
                  <T text="Temps de lecture actif" />
                  <strong className="mt-1 block">
                    {Math.floor(video.activeMs / 60000)} min{" "}
                    {Math.floor(video.activeMs / 1000) % 60} s
                  </strong>
                </p>
                <p>
                  <T text="Durée de la vidéo" />
                  <strong className="mt-1 block">
                    {video.durationMs
                      ? `${Math.floor(video.durationMs / 60000)} min ${Math.floor(video.durationMs / 1000) % 60} s`
                      : "—"}
                  </strong>
                </p>
                <p>
                  <T text="Dernière position" />
                  <strong className="mt-1 block">
                    {Math.floor(video.positionMs / 60000)} min{" "}
                    {Math.floor(video.positionMs / 1000) % 60} s
                  </strong>
                </p>
              </div>
              {video.lastWatchedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(video.lastWatchedAt).toLocaleString(
                    locale === "fr" ? "fr-FR" : "en-GB",
                  )}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <T text={"Activité de la semaine"} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.weeklyMinutes ? (
              <WeeklyActivityChart data={report.weeklyActivity} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                <T
                  text={"Pas encore d’activité enregistrée cette semaine."}
                />{" "}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <T text={"Mes résultats aux quiz"} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.quizTrend.length ? (
              <div>
                <QuizTrendChart data={report.quizTrend} />
                <ol className="mt-4 space-y-2 text-sm">
                  {report.quizTrend.map((entry) => (
                    <li
                      key={entry.attempt}
                      className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-3"
                    >
                      <span>
                        <T text={entry.title} /> · <T text="Essai" />{" "}
                        {entry.attempt}
                      </span>
                      <span className="font-bold text-primary">
                        {entry.score}%
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                <T
                  text={"Votre premier résultat apparaîtra ici après un quiz."}
                />{" "}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mes activités */}
      {report.courseProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <T text={"Mes activités"} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.courseProgress.map((c) => (
              <div key={c.title}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    <T text={c.title} />
                  </span>
                  <span className="text-muted-foreground capitalize">
                    <T
                      text={
                        c.status === "completed"
                          ? "Terminée (déclarée)"
                          : "En cours"
                      }
                    />
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${c.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI analysis */}
      {ai && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <T text={"Les points encourageants"} />{" "}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {ai.strengthsAnalysis}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <T text={"Les prochaines découvertes"} />{" "}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {ai.areasForGrowth}
              </CardContent>
            </Card>
          </div>

          {ai.parentTips?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <T text={"Des idées pour les parents"} />{" "}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {ai.parentTips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">✓</span> <T text={tip} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-primary to-brand-dark text-primary-foreground">
            <CardContent className="space-y-2 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
                <T text={"Une idée pour cette semaine"} />{" "}
              </p>
              <p className="text-lg font-medium">{ai.weeklyGoal}</p>
              <p className="text-sm opacity-90">{ai.encouragement}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
