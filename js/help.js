// Instruções de uso: o que o botão diz e quando o aviso abre sozinho.
const KEY = 'roteiro-dosol-2026-ajuda';

export const goLabel = count => (count ? `Gerar roteiro (${count})` : 'Toque nos shows para escolher');

export function createHelp(getStorage) {
  let seen = false;
  try {
    seen = getStorage().getItem(KEY) === 'vista';
  } catch {
    // armazenamento bloqueado: mostra de novo na próxima visita
  }
  return {
    shouldOpen: selected => !seen && selected === 0,
    markSeen() {
      seen = true;
      try {
        getStorage().setItem(KEY, 'vista');
      } catch {
        // idem
      }
    },
  };
}
