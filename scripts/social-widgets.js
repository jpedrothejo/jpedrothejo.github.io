document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('socialModalOverlay');
  const title = document.getElementById('socialModalTitle');
  const body = document.getElementById('socialModalBody');
  const closeButton = document.getElementById('socialModalClose');
  if (!overlay || !title || !body || !closeButton) return;

  const isPortuguese = document.documentElement.lang.toLowerCase().startsWith('pt');
  const text = isPortuguese
    ? {
        profilePicture: 'Foto de perfil',
        profile: 'Perfil',
        serverDescription: 'Nenhuma descrição foi definida para este servidor.',
        loading: 'Carregando membros...',
        online: 'online agora',
        more: count => `e mais ${count}`,
        loadError: 'Não foi possível carregar os membros do servidor.',
        invalidLink: 'Este link não está disponível.'
      }
    : {
        profilePicture: 'Profile picture',
        profile: 'Profile',
        serverDescription: 'No description has been set for this server.',
        loading: 'Loading members...',
        online: 'online now',
        more: count => `and ${count} more`,
        loadError: 'Could not load the server members.',
        invalidLink: 'This link is unavailable.'
      };

  let closeTimeout;
  let serverWidgetRequest;

  const getAvatarUrl = url => {
    try {
      const profile = new URL(url);
      const host = profile.hostname.toLowerCase();
      const segments = profile.pathname.split('/').filter(Boolean);
      const hasHost = domain => host === domain || host.endsWith(`.${domain}`);

      if (hasHost('youtube.com')) {
        const handle = segments.find(segment => segment.startsWith('@'));
        if (handle) return `https://unavatar.io/youtube/${encodeURIComponent(handle.slice(1))}`;
      }
      if (hasHost('tiktok.com')) {
        const handle = segments.find(segment => segment.startsWith('@'));
        if (handle) return `https://unavatar.io/tiktok/${encodeURIComponent(handle.slice(1))}`;
      }
      if (hasHost('roblox.com')) {
        const usersIndex = segments.findIndex((segment, index) => segment === 'users' && /^\d+$/.test(segments[index + 1] || ''));
        if (usersIndex !== -1) return `https://unavatar.io/roblox/${segments[usersIndex + 1]}`;
      }
      if (hasHost('discord.com')) {
        const usersIndex = segments.findIndex((segment, index) => segment === 'users' && /^\d+$/.test(segments[index + 1] || ''));
        if (usersIndex !== -1) return `https://unavatar.io/discord/${segments[usersIndex + 1]}`;
      }
    } catch (error) {
      console.error('Could not resolve a social profile avatar URL.', error);
    }
    return '';
  };

  const setAvatar = (image, source, fallback) => {
    let usingFallback = !source || source === fallback;
    image.onerror = () => {
      if (!usingFallback) {
        usingFallback = true;
        image.src = fallback;
      } else {
        image.hidden = true;
      }
    };
    image.src = usingFallback ? fallback : source;
  };

  const makeAvatar = (source, fallback, alt = '') => {
    const image = document.createElement('img');
    image.className = 'social-widget-avatar';
    image.alt = alt;
    image.loading = 'lazy';
    setAvatar(image, source, fallback);
    return image;
  };

  const createAccountCard = (link, fallbackImage) => {
    const listItem = document.createElement('li');
    listItem.className = 'social-widget-card';

    let profileUrl;
    try {
      profileUrl = new URL(link.url);
      if (profileUrl.protocol !== 'https:') throw new TypeError('Social profile links must use HTTPS.');
    } catch (error) {
      console.error('A social profile link is invalid.', error);
      const message = document.createElement('span');
      message.className = 'social-widget-status';
      message.textContent = text.invalidLink;
      listItem.append(message);
      return listItem;
    }

    const anchor = document.createElement('a');
    anchor.href = profileUrl.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    let avatarUrl = typeof link.avatar === 'string' ? link.avatar : getAvatarUrl(profileUrl.href);
    if (avatarUrl) {
      try {
        const imageUrl = new URL(avatarUrl);
        if (imageUrl.protocol !== 'https:') throw new TypeError('Profile avatar URLs must use HTTPS.');
        avatarUrl = imageUrl.href;
      } catch (error) {
        console.warn('A social profile avatar URL was invalid.', error);
        avatarUrl = '';
      }
    }
    anchor.append(makeAvatar(avatarUrl, fallbackImage, text.profilePicture));

    const heading = document.createElement('h3');
    heading.textContent = link.label || text.profile;
    anchor.append(heading);

    const username = profileUrl.pathname.match(/\/(@[^/]+)/)?.[1];
    if (username) {
      const handle = document.createElement('span');
      handle.className = 'social-widget-username';
      handle.textContent = username;
      anchor.append(handle);
    }

    listItem.append(anchor);
    return listItem;
  };

  const makeServerAvatar = (widget, item, fallback) => {
    if (item.dataset.serverIcon) {
      try {
        const iconUrl = new URL(item.dataset.serverIcon, window.location.href);
        if (iconUrl.protocol === 'https:' || iconUrl.origin === window.location.origin) return iconUrl.href;
        throw new TypeError('Server icon URLs must use HTTPS or be hosted on this site.');
      } catch (error) {
        console.warn('The configured Discord server icon URL is invalid.', error);
      }
    }
    if (typeof widget.icon === 'string' && widget.icon) {
      if (widget.icon.startsWith('https://')) return widget.icon;
      return `https://cdn.discordapp.com/icons/${encodeURIComponent(widget.id)}/${encodeURIComponent(widget.icon)}.png?size=128`;
    }
    return fallback;
  };

  const createServerCard = (item, fallbackImage) => {
    const listItem = document.createElement('li');
    listItem.className = 'social-widget-card';

    const anchor = document.createElement('a');
    anchor.href = item.dataset.serverInvite;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    const avatar = makeAvatar(fallbackImage, fallbackImage, text.profilePicture);
    const heading = document.createElement('h3');
    heading.textContent = isPortuguese ? 'Servidor do Discord' : 'Discord Server';
    const description = document.createElement('p');
    description.className = 'social-widget-description';
    description.textContent = text.loading;
    description.setAttribute('aria-live', 'polite');
    const members = document.createElement('div');
    members.className = 'social-widget-members';

    anchor.append(avatar, heading, description, members);
    listItem.append(anchor);

    const apiUrl = item.dataset.widgetApi;
    if (!apiUrl) {
      console.error('The Discord server widget API URL is missing.');
      description.textContent = text.loadError;
      return listItem;
    }

    if (!serverWidgetRequest) {
      serverWidgetRequest = fetch(apiUrl)
        .then(response => {
          if (!response.ok) throw new Error(`Discord widget request failed with status ${response.status}.`);
          return response.json();
        })
        .catch(error => {
          serverWidgetRequest = null;
          throw error;
        });
    }

    serverWidgetRequest
      .then(widget => {
        if (typeof widget.id !== 'string' || typeof widget.name !== 'string') {
          throw new TypeError('The Discord widget response is missing its server ID or name.');
        }

        avatar.alt = `${widget.name} ${text.profilePicture}`;
        setAvatar(avatar, makeServerAvatar(widget, item, fallbackImage), fallbackImage);
        heading.textContent = widget.name;
        description.textContent = widget.description || item.dataset.serverDescription || text.serverDescription;

        const onlineMembers = Array.isArray(widget.members) ? widget.members : [];
        const onlineCount = Number.isFinite(widget.presence_count) ? widget.presence_count : onlineMembers.length;
        const count = document.createElement('span');
        count.className = 'social-widget-status';
        count.textContent = `${onlineCount} ${text.online}`;
        members.append(count);

        onlineMembers.slice(0, 3).forEach(member => {
          const memberTag = document.createElement('span');
          memberTag.className = 'social-widget-member';
          memberTag.title = member.username || '';

          const memberImage = document.createElement('img');
          let memberAvatar = fallbackImage;
          if (typeof member.avatar_url === 'string') {
            try {
              const avatarUrl = new URL(member.avatar_url);
              if (avatarUrl.protocol === 'https:' && avatarUrl.hostname === 'cdn.discordapp.com') {
                memberAvatar = avatarUrl.href;
              }
            } catch (error) {
              console.warn('A Discord member avatar URL was invalid.', error);
            }
          }
          setAvatar(memberImage, memberAvatar, fallbackImage);
          memberImage.alt = '';
          memberImage.loading = 'lazy';

          const memberName = document.createElement('span');
          memberName.textContent = member.username || '';
          memberTag.append(memberImage, memberName);
          members.append(memberTag);
        });

        if (onlineMembers.length > 3) {
          const more = document.createElement('span');
          more.className = 'social-widget-more';
          more.textContent = text.more(onlineMembers.length - 3);
          members.append(more);
        }
      })
      .catch(error => {
        console.error('The Discord server widget could not be rendered.', error);
        description.textContent = text.loadError;
      });

    return listItem;
  };

  const openModal = item => {
    title.textContent = item.querySelector('.social-label')?.textContent || text.profile;
    body.replaceChildren();

    let links = [];
    try {
      links = JSON.parse(item.dataset.socialLinks || '[]');
      if (!Array.isArray(links)) throw new TypeError('Social links must be an array.');
    } catch (error) {
      console.error('The social links could not be read.', error);
      links = [];
      const message = document.createElement('li');
      message.className = 'social-widget-status';
      message.textContent = text.invalidLink;
      body.append(message);
    }

    const fallbackImage = item.querySelector('.icon-img')?.src || '';
    links.forEach(link => body.append(createAccountCard(link, fallbackImage)));
    if (item.dataset.serverInvite) body.append(createServerCard(item, fallbackImage));

    window.clearTimeout(closeTimeout);
    overlay.hidden = false;
    overlay.classList.remove('show');
    void overlay.offsetWidth;
    document.body.classList.add('device-modal-open');
    requestAnimationFrame(() => overlay.classList.add('show'));
  };

  document.querySelectorAll('.home-social-links .social-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (/(github\.com|x\.com|twitter\.com|bsky\.app)/i.test(href)) return;
    item.addEventListener('click', event => {
      event.preventDefault();
      openModal(item);
    });
  });

  const closeModal = () => {
    window.clearTimeout(closeTimeout);
    overlay.classList.remove('show');
    closeTimeout = window.setTimeout(() => {
      if (overlay.classList.contains('show')) return;
      overlay.hidden = true;
      document.body.classList.remove('device-modal-open');
    }, 260);
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });
});
