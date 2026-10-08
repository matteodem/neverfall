// Presentation of the existing cumulative quest progress, including sequences.
export const getQuestObjectiveDisplay = (quest, progress = 0) => {
  const total = quest.objective.amount;
  const count = Math.max(0, Math.min(progress, total));
  const completed = !quest.repeatable && count >= total;
  let before = 0;
  const steps = (quest.objectives || [quest.objective]).map((objective, index) => {
    const amount = objective.amount || 1;
    const done = Math.max(0, Math.min(count - before, amount));
    const step = {
      label: objective.label || quest.description,
      count: done, total: amount, number: index + 1,
      completed: done >= amount,
    };
    before += amount;
    return step;
  });
  return { count, total, completed, steps, current: steps.find((step) => !step.completed) || null };
};
