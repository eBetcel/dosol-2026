export const APP_URL = 'https://ebetcel.github.io/dosol-2026/';
const INVITE = 'Monta teu roteiro do Festival DoSol:';

export async function copyLink(nav, value = APP_URL) {
  try {
    await nav.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export async function inviteFriend(nav) {
  if (nav.share) {
    try {
      await nav.share({ text: INVITE, url: APP_URL });
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyLink(nav, `${INVITE} ${APP_URL}`)) ? 'copied' : 'failed';
}

export function inviteHint(outcome) {
  if (outcome === 'copied') return 'Convite copiado: cole numa conversa.';
  if (outcome === 'failed') return `Envie este link: ${APP_URL}`;
  return '';
}
