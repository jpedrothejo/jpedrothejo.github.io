(() => {
  const presenceUrl = 'https://api.statusbadges.me/presence/944684533108854854';

  const copy = {
    en: {
      online: 'Online',
      idle: 'Idle',
      dnd: 'Do not disturb',
      offline: 'Offline',
      unavailable: 'Unavailable',
      coding: 'Coding',
      noCoding: 'Not coding',
      playing: 'Playing',
      notPlaying: 'Not playing',
      loading: 'Loading'
    },
    pt: {
      online: 'Online',
      idle: 'Ausente',
      dnd: 'Não perturbe',
      offline: 'Offline',
      unavailable: 'Indisponível',
      coding: 'Programando',
      noCoding: 'Não está programando',
      playing: 'Jogando',
      notPlaying: 'Não está jogando',
      loading: 'Carregando'
    }
  };

  function updateBadge(root, name, label, value, status) {
    const badge = root.querySelector(`[data-badge="${name}"]`);
    if (!badge) return;
    badge.hidden = false;
    badge.dataset.status = status || 'active';
    badge.querySelector('.status-badge-label').textContent = label;
    const valueElement = badge.querySelector('.status-badge-value');
    valueElement.textContent = value;
    if (valueElement.closest('a')) valueElement.closest('a').title = value;
  }

  function isCodingActivity(activity) {
    if (!activity || typeof activity !== 'object') return false;
    const activityText = [activity.name, activity.details, activity.state, activity.platform].filter(Boolean).join(' ');
    return /\b(?:visual\s+studio\s+code|vscode|vscodium|code(?:\s*[- ]\s*(?:insiders|oss|exe))?|cursor|zed|windsurf|intellij|pycharm|webstorm|phpstorm|clion|goland|android\s+studio|neovim|nvim|vim|helix|replit|github\s+copilot)\b/i.test(activityText)
      || /\b(?:coding|programming|developing|building|working on)\b/i.test(activityText)
      && /\b(?:code|editor|project|workspace|app|application)\b/i.test(activityText);
  }

  async function refreshBadges(root, language) {
    const text = copy[language];
    try {
      const response = await fetch(presenceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Presence request failed: ${response.status}`);
      const presence = await response.json();
      const status = ['online', 'idle', 'dnd', 'offline'].includes(presence.status)
        ? presence.status
        : 'offline';
      updateBadge(root, 'presence', 'Discord', text[status], status);

      const activities = Array.isArray(presence.activities) ? presence.activities : [];
      const coding = activities.find(isCodingActivity);
      const codingDetails = coding
        ? [coding.details, coding.state]
          .filter(value => typeof value === 'string' && value.trim() && !/^workspace\s*:/i.test(value.trim()))
          .join(' - ') || coding.name
        : text.noCoding;
      updateBadge(root, 'coding', text.coding, codingDetails, coding ? 'active' : 'offline');

      const game = activities.find(activity => {
        if (!activity || typeof activity !== 'object') return false;
        if (activity.type === 4 || activity.type === 2) return false;
        if (isCodingActivity(activity)) return false;

        const name = (activity.name || '').trim();
        if (!name || /^(custom status|spotify|youtube|twitch|discord|browser|chrome|firefox|edge)$/i.test(name)) return false;

        const activityText = [activity.name, activity.details, activity.state].filter(Boolean).join(' ');
        return activity.type === 0 && !/\b(?:coding|programming|developing|working on|editor|ide|visual studio code|vscode|cursor)\b/i.test(activityText);
      }) || null;
      const gameDetails = game
        ? [game.details, game.state].filter(Boolean).join(' - ') || game.name
        : text.notPlaying;
      updateBadge(root, 'playing', text.playing, gameDetails, game ? 'active' : 'offline');

      const spotify = activities.find(activity => activity.type === 2 || /spotify/i.test(activity.name || ''));
      const spotifyBadge = root.querySelector('[data-badge="spotify"]');
      if (spotifyBadge) spotifyBadge.hidden = !spotify;
      if (spotify) {
        const track = [spotify.details, spotify.state].filter(Boolean).join(' - ') || text.loading;
        updateBadge(root, 'spotify', 'Spotify', track, 'active');
      }
    } catch (error) {
      updateBadge(root, 'presence', 'Discord', text.unavailable, 'unavailable');
      updateBadge(root, 'coding', text.coding, text.unavailable, 'unavailable');
      updateBadge(root, 'playing', text.playing, text.unavailable, 'unavailable');
      console.warn('Could not load Discord presence badges', error);
    }
  }

  function initialize() {
    const language = document.documentElement.lang.toLowerCase().startsWith('pt') || location.pathname.startsWith('/br/')
      ? 'pt'
      : 'en';
    document.querySelectorAll('[data-presence-badges]').forEach(root => {
      refreshBadges(root, language);
      window.setInterval(() => {
        if (document.visibilityState === 'visible') refreshBadges(root, language);
      }, 30000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshBadges(root, language);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();