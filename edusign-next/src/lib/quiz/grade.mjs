/** Grade choices against the versioned lesson, never against client scores. */
export function gradeQuiz(quiz, answers) {
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length)
    throw new Error("Answer every question");
  const choices = new Map();
  for (const answer of answers) {
    if (
      !answer ||
      typeof answer.questionId !== "string" ||
      typeof answer.choice !== "string" ||
      choices.has(answer.questionId)
    )
      throw new Error("Invalid or duplicate answer");
    choices.set(answer.questionId, answer.choice);
  }
  const graded = quiz.questions.map((question) => {
    const choice = choices.get(question.id);
    if (!question.options.some((option) => option.id === choice))
      throw new Error("Unknown question or choice");
    return {
      questionId: question.id,
      choice,
      correct: choice === question.correctOption,
    };
  });
  const correct = graded.filter((answer) => answer.correct).length;
  return {
    answers: graded,
    correct,
    totalQuestions: graded.length,
    score: Math.round((correct / graded.length) * 100),
  };
}
