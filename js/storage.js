const KEY = 'roteiro-dosol-2026';

export function createSelection(getStorage, validIds) {
  const selected = new Set(load());

  function load() {
    try {
      const saved = JSON.parse(getStorage().getItem(KEY));
      return Array.isArray(saved) ? saved.filter(id => validIds.has(id)) : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      getStorage().setItem(KEY, JSON.stringify([...selected]));
    } catch {
      // aba privada ou armazenamento bloqueado: a seleção vale só nesta visita
    }
  }

  return {
    has: id => selected.has(id),
    toggle(id) {
      if (!selected.delete(id)) selected.add(id);
      save();
    },
    ids: () => [...selected],
  };
}
