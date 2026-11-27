const DAY_MINUTES = 24 * 60;
const NIGHT_ENDS = 6 * 60;
const DURATION = 40;
const STAGE_DURATION = { frisson: 120 };

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m;
  return total < NIGHT_ENDS ? total + DAY_MINUTES : total;
}

export function formatTime(time) {
  const [h, m] = time.split(':');
  return m === '00' ? `${h}h` : `${h}h${m}`;
}

export function showsOfDay(day) {
  return day.stages
    .flatMap(stage => stage.shows.map(show => {
      const start = toMinutes(show.time);
      return {
        ...show,
        stageId: stage.id,
        stageName: stage.name,
        start,
        end: start + (STAGE_DURATION[stage.id] ?? DURATION),
      };
    }))
    .sort((a, b) => a.start - b.start); // sort estável mantém a ordem dos palcos
}

export function findConflicts(shows) {
  const ids = new Set();
  shows.forEach((a, i) => shows.slice(i + 1).forEach(b => {
    if (a.start < b.end && b.start < a.end) ids.add(a.id).add(b.id);
  }));
  return ids;
}

export function defaultDayId(now) {
  return now >= new Date(2026, 10, 28, 6, 0) ? 'sab' : 'sex';
}
