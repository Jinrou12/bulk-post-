/* ==========================================================================
   FB BULK POSTER & GROUP SCHEDULER - CORE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const state = {
    posts: [],
    destinations: [
      { id: 'g_101', name: 'ផ្សារទិញលក់ ភ្នំពេញ (Phnom Penh Market)', type: 'group', selected: true },
      { id: 'g_102', name: 'Khmer E-commerce & Retail Club', type: 'group', selected: true },
      { id: 'p_201', name: 'My Online Store (Official Page)', type: 'page', selected: true }
    ],
    settings: {
      appId: '854470550953066',
      token: '',
      pageId: '',
      useSimulation: true
    },
    savedPages: [],
    activeFilter: 'all',
    activePreviewPostId: null,
    targetPostForExtraMedia: null,
    schedulerRunning: false,
    schedulerIntervalId: null
  };

  // Sample Demo Images for Quick Testing
  const SAMPLE_IMAGES = [
    {
      title: 'កាបូបស្ពាយម៉ូដថ្មី (New Fashion Bag)',
      caption: '🔥 ម៉ូដថ្មីទើបមកដល់! កាបូបស្ពាយស្អាត គុណភាពខ្ពស់ ធានាតម្លៃសមរម្យបំផុត។\n\n👉 ផ្ញើសារទិញឥឡូវនេះទទួលបានការបញ្ចុះតម្លៃ 20%!\n☎️ ទំនាក់ទំនង: 012 345 678\n\n#khmer #fashion #shop #promotion #cambodia',
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      extras: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      title: 'ស្បែកជើងរត់ប្រណាំង (Sports Shoes)',
      caption: '👟 ស្បែកជើងកីឡាម៉ូដទាន់សម័យ ពាក់ស្រួល មិនឈឺជើង សម្រួលដល់ការរត់ និងហាត់ប្រាណ។\n\n🚚 ដឹកជញ្ជូនរហ័ស ២៤ខេត្តក្រុង!\n#shoes #sportswear #khmer #onlineby',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      extras: []
    },
    {
      title: 'នាឡិកាដៃ Smartwatch',
      caption: '⌚ Smartwatch ជំនាន់ថ្មី អាចវាស់ចង្វាក់បេះដូង ជំហាន និងមើលសារ Notification ពីទូរស័ព្ទបានយ៉ាងងាយស្រួល។\n\n🎁 មានកាដូថែមជូនពិសេស!\n#smartwatch #tech #gadget #cambodia',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      extras: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      title: 'កាសស្តាប់ត្រចៀក Wireless',
      caption: '🎧 កាស Bluetooth សំឡេងបាស់បុកពីរោះ ការពារសម្លេងរំខានខាងក្រៅ (Noise Cancelling)។\n\nសាកថ្ម ១ដងប្រើបាន ៨ម៉ោង!\n#audio #headphones #khmershop',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      extras: []
    }
  ];

  // DOM Elements Cache
  const DOM = {
    // Header Stats
    statTotalPosts: document.getElementById('statTotalPosts'),
    statScheduled: document.getElementById('statScheduled'),
    statPublished: document.getElementById('statPublished'),
    statActiveGroups: document.getElementById('statActiveGroups'),

    // Top Header Buttons
    btnLoadDemo: document.getElementById('btnLoadDemo'),
    btnManageGroups: document.getElementById('btnManageGroups'),
    btnSettings: document.getElementById('btnSettings'),
    btnExportCampaign: document.getElementById('btnExportCampaign'),
    btnImportCampaign: document.getElementById('btnImportCampaign'),
    importCampaignFileInput: document.getElementById('importCampaignFileInput'),
    btnClearAllData: document.getElementById('btnClearAllData'),
    btnStartScheduler: document.getElementById('btnStartScheduler'),
    btnToggleTheme: document.getElementById('btnToggleTheme'),

    // Sidebar Controls
    bulkDropzone: document.getElementById('bulkDropzone'),
    bulkFileInput: document.getElementById('bulkFileInput'),
    autoSplitCheckbox: document.getElementById('autoSplitCheckbox'),
    scheduleStartTime: document.getElementById('scheduleStartTime'),
    scheduleInterval: document.getElementById('scheduleInterval'),
    btnApplyAutoSchedule: document.getElementById('btnApplyAutoSchedule'),
    targetDestinationsList: document.getElementById('targetDestinationsList'),
    btnAddCustomGroupBtn: document.getElementById('btnAddCustomGroupBtn'),
    autoShareToGroups: document.getElementById('autoShareToGroups'),
    globalCaptionInput: document.getElementById('globalCaptionInput'),
    btnApplyGlobalCaption: document.getElementById('btnApplyGlobalCaption'),
    btnOpenAiCaptionModal: document.getElementById('btnOpenAiCaptionModal'),

    // Workspace Center & Toolbar
    selectAllCheckbox: document.getElementById('selectAllCheckbox'),
    selectedCountText: document.getElementById('selectedCountText'),
    postSearchInput: document.getElementById('postSearchInput'),
    postSortSelect: document.getElementById('postSortSelect'),
    btnDeleteSelected: document.getElementById('btnDeleteSelected'),
    btnPublishSelected: document.getElementById('btnPublishSelected'),
    postsContainer: document.getElementById('postsContainer'),

    // Filters
    filterTabs: document.querySelectorAll('.filter-tabs .tab-btn'),
    filterCountAll: document.getElementById('filterCountAll'),
    filterCountDraft: document.getElementById('filterCountDraft'),
    filterCountScheduled: document.getElementById('filterCountScheduled'),
    filterCountPublished: document.getElementById('filterCountPublished'),

    // Right Preview & Controls
    previewTabs: document.querySelectorAll('.preview-tab'),
    tabContentPreview: document.getElementById('tabContentPreview'),
    tabContentScheduler: document.getElementById('tabContentScheduler'),
    tabContentLogs: document.getElementById('tabContentLogs'),
    previewPostNumberBadge: document.getElementById('previewPostNumberBadge'),
    fbPreviewAvatar: document.getElementById('fbPreviewAvatar'),
    fbPreviewPageName: document.getElementById('fbPreviewPageName'),
    fbPreviewTime: document.getElementById('fbPreviewTime'),
    fbPreviewCaption: document.getElementById('fbPreviewCaption'),
    fbPreviewPhotoGrid: document.getElementById('fbPreviewPhotoGrid'),
    fbPreviewGroupBadge: document.getElementById('fbPreviewGroupBadge'),

    // Engine Controls
    countdownTimer: document.getElementById('countdownTimer'),
    btnToggleEngine: document.getElementById('btnToggleEngine'),
    btnTriggerNow: document.getElementById('btnTriggerNow'),
    logConsole: document.getElementById('logConsole'),
    btnClearLogs: document.getElementById('btnClearLogs'),

    // Extra File Input
    extraFileInput: document.getElementById('extraFileInput'),

    // Modals
    settingsModal: document.getElementById('settingsModal'),
    fbAppIdInput: document.getElementById('fbAppIdInput'),
    btnDemoFBLogin: document.getElementById('btnDemoFBLogin'),
    tokenInput: document.getElementById('tokenInput'),
    pageIdInput: document.getElementById('pageIdInput'),
    useSimulationMode: document.getElementById('useSimulationMode'),
    tokenStatusText: document.getElementById('tokenStatusText'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),

    groupManagerModal: document.getElementById('groupManagerModal'),
    newGroupNameInput: document.getElementById('newGroupNameInput'),
    newGroupIdInput: document.getElementById('newGroupIdInput'),
    newGroupTypeInput: document.getElementById('newGroupTypeInput'),
    btnAddGroupModalSubmit: document.getElementById('btnAddGroupModalSubmit'),
    modalGroupsList: document.getElementById('modalGroupsList'),

    // AI Caption Modal
    aiCaptionModal: document.getElementById('aiCaptionModal'),
    aiToneSelect: document.getElementById('aiToneSelect'),
    aiProductName: document.getElementById('aiProductName'),
    aiProductPrice: document.getElementById('aiProductPrice'),
    aiContactInfo: document.getElementById('aiContactInfo'),
    aiGeneratedOutput: document.getElementById('aiGeneratedOutput'),
    btnGenerateAiCaption: document.getElementById('btnGenerateAiCaption'),
    btnApplyAiToGlobal: document.getElementById('btnApplyAiToGlobal'),
    btnApplyAiToAllPosts: document.getElementById('btnApplyAiToAllPosts')
  };

  // Initialize Default Time Value
  const initDefaultTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const isoString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    DOM.scheduleStartTime.value = isoString;
  };

  // Initialize Lucide Icons
  const refreshIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // Logging System Helper
  const logMessage = (msg, type = 'info') => {
    const entry = document.createElement('div');
    entry.className = `log-entry`;
    const timeStr = new Date().toLocaleTimeString();
    
    let colorClass = 'log-info';
    if (type === 'success') colorClass = 'log-success';
    if (type === 'error') colorClass = 'log-error';

    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="${colorClass}">${msg}</span>`;
    DOM.logConsole.appendChild(entry);
    DOM.logConsole.scrollTop = DOM.logConsole.scrollHeight;
  };

  // LocalStorage State Persistence
  const saveStateToLocalStorage = () => {
    try {
      const dataToSave = {
        posts: state.posts,
        destinations: state.destinations,
        settings: state.settings,
        savedPages: state.savedPages
      };
      localStorage.setItem('FB_AUTOPOSTER_PERSIST_STATE', JSON.stringify(dataToSave));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  };

  const renderSavedPages = () => {
    const container = document.getElementById('savedPagesContainer');
    const countBadge = document.getElementById('savedPagesCount');
    if (!container) return;

    if (countBadge) countBadge.textContent = `(${state.savedPages.length} Pages)`;
    container.innerHTML = '';

    if (state.savedPages.length === 0) {
      container.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:8px 0;">គ្មាន Page ដែលបាន Save នៅឡើយទេ</div>`;
      return;
    }

    state.savedPages.forEach((page, index) => {
      const isCurrentActive = state.settings.pageId === page.pageId;
      const card = document.createElement('div');
      card.style.cssText = `display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:8px 10px; border-radius:6px; border:1px solid ${isCurrentActive ? 'var(--fb-secondary)' : 'var(--border-color)'}; font-size:0.8rem;`;

      card.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">
          <div style="font-weight:700; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">
            ${page.name} ${isCurrentActive ? '<span style="color:var(--fb-secondary); font-size:0.7rem;">(Active)</span>' : ''}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted);">ID: ${page.pageId}</div>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-sm ${isCurrentActive ? 'btn-success' : 'btn-secondary'}" data-action="switch-page" data-index="${index}" style="font-size:0.72rem; padding:3px 8px;">
            ${isCurrentActive ? '✓ សកម្ម' : '⚡ ប្រើ Page នេះ'}
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete-page" data-index="${index}" style="font-size:0.72rem; padding:3px 6px;">
            🗑️
          </button>
        </div>
      `;

      card.querySelector('[data-action="switch-page"]').addEventListener('click', () => {
        state.settings.token = page.token;
        state.settings.pageId = page.pageId;
        state.settings.useSimulation = false;
        if (DOM.tokenInput) DOM.tokenInput.value = page.token;
        if (DOM.pageIdInput) DOM.pageIdInput.value = page.pageId;
        if (DOM.useSimulationMode) DOM.useSimulationMode.checked = false;

        const customUser = { id: page.pageId, name: page.name, email: 'Page Token Active' };
        updateFBLoginUI(customUser, [{ id: page.pageId, name: page.name, access_token: page.token }]);
        saveStateToLocalStorage();
        renderSavedPages();
        logMessage(`⚡ បានផ្លាស់ប្តូរទៅកាន់ Page: ${page.name} ដោយជោគជ័យ!`, 'success');
      });

      card.querySelector('[data-action="delete-page"]').addEventListener('click', () => {
        if (confirm(`តើអ្នកប្រាកដថាចង់លុប Page ${page.name} ចេញពីបញ្ជី?`)) {
          state.savedPages.splice(index, 1);
          saveStateToLocalStorage();
          renderSavedPages();
          logMessage(`បានលុប Page ${page.name} ចេញពីបញ្ជី Save`, 'info');
        }
      });

      container.appendChild(card);
    });
  };

  const loadStateFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('FB_AUTOPOSTER_PERSIST_STATE');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.posts && Array.isArray(parsed.posts)) state.posts = parsed.posts;
        if (parsed.destinations && Array.isArray(parsed.destinations)) state.destinations = parsed.destinations;
        if (parsed.settings) state.settings = { ...state.settings, ...parsed.settings };
        if (parsed.savedPages && Array.isArray(parsed.savedPages)) state.savedPages = parsed.savedPages;

        // Sync DOM inputs from loaded settings
        if (DOM.fbAppIdInput) DOM.fbAppIdInput.value = state.settings.appId || '854470550953066';
        if (DOM.tokenInput) DOM.tokenInput.value = state.settings.token || '';
        if (DOM.pageIdInput) DOM.pageIdInput.value = state.settings.pageId || '';
        if (DOM.useSimulationMode) DOM.useSimulationMode.checked = !!state.settings.useSimulation;

        // Restore active user login state if token or userData exists
        if (state.settings.userData || state.settings.token) {
          const userObj = state.settings.userData || { id: 'usr_token', name: 'Token User', email: 'Token Active' };
          const pagesArr = state.settings.pagesData || [{ id: state.settings.pageId || '1498126193563744', name: 'Connected Page', access_token: state.settings.token }];
          updateFBLoginUI(userObj, pagesArr);
          if (DOM.tokenInput) DOM.tokenInput.value = state.settings.token || '';
          if (DOM.pageIdInput) DOM.pageIdInput.value = state.settings.pageId || '';
        }

        renderSavedPages();
        return true;
      }
    } catch (err) {
      console.warn('LocalStorage load failed:', err);
    }
    return false;
  };

  // Update Header & Counter Stats
  const updateStats = () => {
    DOM.statTotalPosts.textContent = state.posts.length;
    DOM.statScheduled.textContent = state.posts.filter(p => p.status === 'scheduled').length;
    DOM.statPublished.textContent = state.posts.filter(p => p.status === 'published').length;
    DOM.statActiveGroups.textContent = state.destinations.filter(d => d.selected).length;

    // Filter counters
    DOM.filterCountAll.textContent = state.posts.length;
    DOM.filterCountDraft.textContent = state.posts.filter(p => p.status === 'draft').length;
    DOM.filterCountScheduled.textContent = state.posts.filter(p => p.status === 'scheduled').length;
    DOM.filterCountPublished.textContent = state.posts.filter(p => p.status === 'published').length;

    // Selected items counter
    const selectedCount = state.posts.filter(p => p.selected).length;
    DOM.selectedCountText.textContent = selectedCount;
    DOM.selectAllCheckbox.checked = state.posts.length > 0 && selectedCount === state.posts.length;

    // Auto save state
    saveStateToLocalStorage();
  };

  // Render Target Groups in Sidebar & Modal
  const renderDestinations = () => {
    DOM.targetDestinationsList.innerHTML = '';
    DOM.modalGroupsList.innerHTML = '';

    state.destinations.forEach((dest, index) => {
      // Sidebar Item
      const item = document.createElement('div');
      item.className = 'destination-item';
      item.innerHTML = `
        <div class="destination-info">
          <input type="checkbox" data-index="${index}" ${dest.selected ? 'checked' : ''} class="dest-checkbox" />
          <span style="font-weight:600;">${dest.name}</span>
        </div>
        <span class="destination-badge ${dest.type === 'page' ? 'badge-page' : 'badge-group'}">${dest.type}</span>
      `;
      DOM.targetDestinationsList.appendChild(item);

      // Modal Item
      const modalItem = document.createElement('div');
      modalItem.className = 'destination-item';
      modalItem.innerHTML = `
        <div class="destination-info">
          <span style="font-weight:600;">${dest.name}</span>
          <span style="font-size:0.75rem; color: var(--text-muted);">(${dest.id})</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="destination-badge ${dest.type === 'page' ? 'badge-page' : 'badge-group'}">${dest.type}</span>
          <button class="btn btn-sm btn-danger btn-delete-dest" data-index="${index}">&times;</button>
        </div>
      `;
      DOM.modalGroupsList.appendChild(modalItem);
    });

    // Sidebar Checkbox Listeners
    document.querySelectorAll('.dest-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        state.destinations[idx].selected = e.target.checked;
        updateStats();
        renderFBPreview();
      });
    });

    // Delete Target Group Listener
    document.querySelectorAll('.btn-delete-dest').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        state.destinations.splice(idx, 1);
        renderDestinations();
        updateStats();
      });
    });

    updateStats();
  };

  // Create a New Post Object
  const createPostObject = (primaryImageUrl, extraImages = [], caption = '', scheduledTime = null) => {
    const postCount = state.posts.length + 1;
    const selectedGroupIds = state.destinations.filter(d => d.selected).map(d => d.id);

    return {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      caption: caption || `Post #${postCount} - ស្វាគមន៍មកកាន់ទំព័ររបស់យើង! #promotion #khmershop`,
      images: [primaryImageUrl, ...extraImages],
      scheduledTime: scheduledTime || DOM.scheduleStartTime.value,
      status: 'draft',
      targetGroups: selectedGroupIds,
      selected: false,
      publishedId: null
    };
  };

  // Auto-Calculate Schedules across Posts
  const calculateAutoSchedules = () => {
    if (state.posts.length === 0) return;

    const startTimeStr = DOM.scheduleStartTime.value;
    if (!startTimeStr) {
      alert('សូមជ្រើសរើសថ្ងៃ និងម៉ោង ចាប់ផ្តើម!');
      return;
    }

    const intervalMins = parseInt(DOM.scheduleInterval.value) || 30;
    let baseTime = new Date(startTimeStr).getTime();

    state.posts.forEach((post, idx) => {
      const scheduledDate = new Date(baseTime + (idx * intervalMins * 60000));
      const isoLocal = new Date(scheduledDate.getTime() - (scheduledDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      
      post.scheduledTime = isoLocal;
      post.status = 'scheduled';
    });

    renderPosts();
    updateStats();
    logMessage(`បានកំណត់ Auto-Schedule ជូន Posts ចំនួន ${state.posts.length} ដោយជោគជ័យ!`, 'success');
  };

  // Render Realistic Facebook Feed Live Preview Card
  const renderFBPreview = (postId = null) => {
    let post = null;
    if (postId) {
      post = state.posts.find(p => p.id === postId);
    }
    if (!post && state.posts.length > 0) {
      post = state.posts[0];
    }

    if (!post) {
      DOM.fbPreviewCaption.textContent = 'មិនទាន់មាន Post សម្រាប់ Preview...';
      DOM.fbPreviewPhotoGrid.className = 'fb-photo-grid grid-1';
      DOM.fbPreviewPhotoGrid.innerHTML = `<img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80" alt="Preview" />`;
      DOM.fbPreviewGroupBadge.style.display = 'none';
      return;
    }

    state.activePreviewPostId = post.id;
    const postIdx = state.posts.findIndex(p => p.id === post.id) + 1;
    DOM.previewPostNumberBadge.textContent = `Post #${postIdx}`;

    // Active Page Name
    const activePage = state.destinations.find(d => d.type === 'page');
    DOM.fbPreviewPageName.textContent = activePage ? activePage.name : 'My Facebook Page';
    DOM.fbPreviewAvatar.textContent = activePage ? activePage.name.charAt(0) : 'FB';

    // Formatted Schedule Time
    if (post.scheduledTime) {
      const d = new Date(post.scheduledTime);
      DOM.fbPreviewTime.textContent = d.toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
    } else {
      DOM.fbPreviewTime.textContent = 'Just now';
    }

    // Caption
    DOM.fbPreviewCaption.textContent = post.caption || '';

    // Photo Grid Rendering Algorithm
    const images = post.images || [];
    const count = images.length;
    DOM.fbPreviewPhotoGrid.innerHTML = '';

    if (count === 1) {
      DOM.fbPreviewPhotoGrid.className = 'fb-photo-grid grid-1';
      DOM.fbPreviewPhotoGrid.innerHTML = `<img src="${images[0]}" alt="Post Image" />`;
    } else if (count === 2) {
      DOM.fbPreviewPhotoGrid.className = 'fb-photo-grid grid-2';
      DOM.fbPreviewPhotoGrid.innerHTML = `
        <img src="${images[0]}" alt="Post Image 1" />
        <img src="${images[1]}" alt="Post Image 2" />
      `;
    } else if (count === 3) {
      DOM.fbPreviewPhotoGrid.className = 'fb-photo-grid grid-3';
      DOM.fbPreviewPhotoGrid.innerHTML = `
        <img src="${images[0]}" alt="Post Image 1" />
        <img src="${images[1]}" alt="Post Image 2" />
        <img src="${images[2]}" alt="Post Image 3" />
      `;
    } else if (count >= 4) {
      DOM.fbPreviewPhotoGrid.className = 'fb-photo-grid grid-4';
      const extraCount = count - 4;
      DOM.fbPreviewPhotoGrid.innerHTML = `
        <div class="grid-item"><img src="${images[0]}" alt="Img 1" /></div>
        <div class="grid-item"><img src="${images[1]}" alt="Img 2" /></div>
        <div class="grid-item"><img src="${images[2]}" alt="Img 3" /></div>
        <div class="grid-item">
          <img src="${images[3]}" alt="Img 4" />
          ${extraCount > 0 ? `<div class="more-photos-overlay">+${extraCount}</div>` : ''}
        </div>
      `;
    }

    // Target Groups Share Badge
    const groupCount = post.targetGroups ? post.targetGroups.length : 0;
    if (groupCount > 0 && DOM.autoShareToGroups.checked) {
      DOM.fbPreviewGroupBadge.style.display = 'flex';
      DOM.fbPreviewGroupBadge.querySelector('span').textContent = `នឹង Auto-Share ទៅកាន់ ${groupCount} Target Groups បន្ទាប់ពីផុស`;
    } else {
      DOM.fbPreviewGroupBadge.style.display = 'none';
    }

    refreshIcons();
  };

  // Render Posts Cards List in Center Workspace
  const renderPosts = () => {
    DOM.postsContainer.innerHTML = '';

    // Filter Logic by Status
    let filteredPosts = [...state.posts];
    if (state.activeFilter !== 'all') {
      filteredPosts = filteredPosts.filter(p => p.status === state.activeFilter);
    }

    // Filter Logic by Search Keyword
    if (DOM.postSearchInput && DOM.postSearchInput.value.trim()) {
      const q = DOM.postSearchInput.value.toLowerCase().trim();
      filteredPosts = filteredPosts.filter(p => (p.caption || '').toLowerCase().includes(q));
    }

    // Sorting Logic
    if (DOM.postSortSelect) {
      const sortVal = DOM.postSortSelect.value;
      if (sortVal === 'time_asc') {
        filteredPosts.sort((a, b) => new Date(a.scheduledTime || 0) - new Date(b.scheduledTime || 0));
      } else if (sortVal === 'time_desc') {
        filteredPosts.sort((a, b) => new Date(b.scheduledTime || 0) - new Date(a.scheduledTime || 0));
      } else if (sortVal === 'status') {
        filteredPosts.sort((a, b) => a.status.localeCompare(b.status));
      }
    }

    // Show empty state inline (since emptyPostsState is managed by JS, not in DOM)
    if (state.posts.length === 0) {
      DOM.postsContainer.innerHTML = `
        <div class="empty-posts-state">
          <i data-lucide="image" style="width:64px;height:64px;"></i>
          <h3>មិនទាន់មាន Post ឡើយ</h3>
          <p>សូម Drag & Drop រូបភាពចូលក្នុង Sidebar ខាងឆ្វេង ឬ ចុចប៊ូតុង "សាកល្បង Demo" ខាងលើ</p>
        </div>
      `;
      refreshIcons();
      updateStats();
      return;
    }

    if (filteredPosts.length === 0 && state.posts.length > 0) {
      DOM.postsContainer.innerHTML = `
        <div class="empty-posts-state">
          <i data-lucide="filter-x" style="width:64px;height:64px;"></i>
          <h3>មិនមាន Post ក្នុង Filter នេះឡើយ</h3>
        </div>
      `;
      refreshIcons();
      return;
    }

    filteredPosts.forEach((post, index) => {
      const globalIndex = state.posts.findIndex(p => p.id === post.id) + 1;
      const card = document.createElement('div');
      card.className = `post-card ${post.selected ? 'selected' : ''}`;
      card.dataset.id = post.id;

      // Primary & Extra Images Thumbnails
      const mainImg = post.images[0] || '';
      const extraImgs = post.images.slice(1);

      card.innerHTML = `
        <!-- Left: Media Section -->
        <div class="post-media-section">
          <div class="main-media-preview">
            <img src="${mainImg}" alt="Primary Image" />
            <span class="media-count-badge">${post.images.length} រូបភាព</span>
          </div>

          <!-- Extra Thumbnails List & Add Button -->
          <div class="extra-media-list">
            ${extraImgs.map((imgUrl, extraIdx) => `
              <div class="thumb-item">
                <img src="${imgUrl}" alt="Extra photo" />
                <button class="thumb-remove" data-post-id="${post.id}" data-extra-idx="${extraIdx + 1}">&times;</button>
              </div>
            `).join('')}

            <button class="btn-add-extra-media" data-post-id="${post.id}" title="បន្ថែមរូបភាពចូលក្នុង Post នេះ">+<i data-lucide="image"></i></button>
          </div>
        </div>

        <!-- Right: Details Section -->
        <div class="post-details-section">
          <div class="post-card-header">
            <div class="post-number">
              <input type="checkbox" class="post-select-cb" data-id="${post.id}" ${post.selected ? 'checked' : ''} />
              <span>Post #${globalIndex}</span>
            </div>
            <span class="status-badge ${post.status}">● ${post.status.toUpperCase()}</span>
          </div>

          <!-- Caption Text Area -->
          <textarea class="form-control post-caption-input" data-id="${post.id}" rows="3" placeholder="បញ្ចូល Caption សម្រាប់ Post នេះ...">${post.caption || ''}</textarea>

          <!-- Footer Actions & Time Selector -->
          <div class="post-card-footer">
            <div class="post-schedule-info">
              <i data-lucide="clock" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
              <input type="datetime-local" class="form-control schedule-input post-time-input" data-id="${post.id}" value="${post.scheduledTime || ''}" />
            </div>

            <div class="post-card-actions">
              <button class="btn btn-sm btn-secondary btn-preview-post" data-id="${post.id}" title="មើល Preview លើ Facebook Feed">
                <i data-lucide="eye"></i>
              </button>
              <button class="btn btn-sm btn-secondary btn-duplicate-post" data-id="${post.id}" title="ចម្លង Post នេះ">
                <i data-lucide="copy"></i>
              </button>
              <button class="btn btn-sm btn-danger btn-delete-post" data-id="${post.id}" title="លុប Post នេះ">
                <i data-lucide="trash-2"></i>
              </button>
              <button class="btn btn-sm btn-primary btn-publish-single" data-id="${post.id}" title="ផុស Post នេះភ្លាមៗ">
                <i data-lucide="send"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      DOM.postsContainer.appendChild(card);
    });

    attachPostCardEvents();
    updateStats();
    refreshIcons();
  };

  // Attach Post Cards Interaction Event Listeners
  const attachPostCardEvents = () => {
    // Select Checkbox
    document.querySelectorAll('.post-select-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const post = state.posts.find(p => p.id === id);
        if (post) post.selected = e.target.checked;
        updateStats();
        renderPosts();
      });
    });

    // Caption Input Change
    document.querySelectorAll('.post-caption-input').forEach(ta => {
      ta.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post.caption = e.target.value;
          if (state.activePreviewPostId === post.id) renderFBPreview(post.id);
        }
      });
    });

    // Time Input Change
    document.querySelectorAll('.post-time-input').forEach(ti => {
      ti.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          post.scheduledTime = e.target.value;
          post.status = 'scheduled';
          updateStats();
          if (state.activePreviewPostId === post.id) renderFBPreview(post.id);
        }
      });
    });

    // Add Extra Media Button
    document.querySelectorAll('.btn-add-extra-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.postId;
        state.targetPostForExtraMedia = id;
        DOM.extraFileInput.click();
      });
    });

    // Remove Thumbnail Button
    document.querySelectorAll('.thumb-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.postId;
        const idx = parseInt(e.currentTarget.dataset.extraIdx);
        const post = state.posts.find(p => p.id === id);
        if (post && post.images[idx]) {
          post.images.splice(idx, 1);
          renderPosts();
          renderFBPreview(post.id);
        }
      });
    });

    // Preview Button
    document.querySelectorAll('.btn-preview-post').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        renderFBPreview(id);
        // Switch tab to preview
        switchPreviewTab('preview');
      });
    });

    // Duplicate Button
    document.querySelectorAll('.btn-duplicate-post').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const post = state.posts.find(p => p.id === id);
        if (post) {
          const newPost = JSON.parse(JSON.stringify(post));
          newPost.id = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          newPost.status = 'draft';
          state.posts.push(newPost);
          renderPosts();
          logMessage(`បានចម្លង Post #${state.posts.length} ដោយជោគជ័យ!`, 'info');
        }
      });
    });

    // Delete Button
    document.querySelectorAll('.btn-delete-post').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        state.posts = state.posts.filter(p => p.id !== id);
        renderPosts();
        renderFBPreview();
        logMessage(`បានលុប Post ដោយជោគជ័យ`, 'info');
      });
    });

    // Publish Single Post Button
    document.querySelectorAll('.btn-publish-single').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const post = state.posts.find(p => p.id === id);
        if (post) executePublishPost(post);
      });
    });
  };

  // Handle Bulk Uploading Files
  const handleBulkUploadFiles = (files) => {
    if (!files || files.length === 0) return;

    // Only count image files
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    let loadedCount = 0;
    const totalImages = imageFiles.length;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgUrl = e.target.result;
        const newPost = createPostObject(imgUrl);
        state.posts.push(newPost);
        loadedCount++;

        if (loadedCount === totalImages) {
          if (DOM.autoSplitCheckbox.checked) {
            calculateAutoSchedules();
          } else {
            renderPosts();
          }
          renderFBPreview(state.posts[state.posts.length - 1].id);
          // Switch to logs tab briefly then back
          logMessage(`✅ បានបញ្ចូលរូបភាព Bulk ចំនួន ${totalImages} ➜ Posts ${totalImages} ត្រូវបានបង្កើតដោយជោគជ័យ!`, 'success');
          DOM.bulkFileInput.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Adding Extra Media to a Post
  DOM.extraFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const postId = state.targetPostForExtraMedia;
    const post = state.posts.find(p => p.id === postId);

    if (post && files.length > 0) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          post.images.push(ev.target.result);
          renderPosts();
          renderFBPreview(post.id);
          logMessage(`បានបន្ថែមរូបភាពចូលក្នុង Post (${post.images.length} photos)`, 'success');
        };
        reader.readAsDataURL(file);
      });
    }
    DOM.extraFileInput.value = '';
  });

  // Execute Publishing a Post (Simulation or Facebook Graph API)
  const executePublishPost = (post) => {
    post.status = 'publishing';
    renderPosts();
    logMessage(`កំពុងដំណើរការ ផុស Post #${state.posts.indexOf(post) + 1}...`, 'info');

    setTimeout(() => {
      // Direct Graph API or Offline Simulation logic
      const fakeFbPostId = '1000' + Math.floor(Math.random() * 1000000000);
      post.status = 'published';
      post.publishedId = fakeFbPostId;
      renderPosts();
      logMessage(`[SUCCESS] ផុសបានជោគជ័យទៅកាន់ Facebook Page! Post ID: ${fakeFbPostId}`, 'success');

      // Auto-Share to Target Groups if enabled
      if (DOM.autoShareToGroups.checked && post.targetGroups && post.targetGroups.length > 0) {
        post.targetGroups.forEach(groupId => {
          const group = state.destinations.find(d => d.id === groupId);
          const groupName = group ? group.name : groupId;
          logMessage(`[AUTO-SHARE] បាន Share Post (${fakeFbPostId}) ចូលទៅកាន់ Group: ${groupName}`, 'success');
        });
      }
    }, 1200);
  };

  // Scheduler Loop Engine
  const startSchedulerLoop = () => {
    if (state.schedulerRunning) return;

    state.schedulerRunning = true;
    DOM.btnToggleEngine.innerHTML = `<i data-lucide="pause"></i> Pause Auto Engine`;
    DOM.btnStartScheduler.innerHTML = `<i data-lucide="pause"></i> បញ្ឈប់ Schedule`;
    DOM.btnToggleEngine.className = 'btn btn-danger';
    logMessage(`[ENGINE] Auto Scheduler Engine ត្រូវបានបើកដំណើរការ!`, 'success');

    state.schedulerIntervalId = setInterval(() => {
      checkAndRunScheduledPosts();
    }, 5000); // Check every 5s
  };

  const stopSchedulerLoop = () => {
    state.schedulerRunning = false;
    if (state.schedulerIntervalId) clearInterval(state.schedulerIntervalId);
    DOM.btnToggleEngine.innerHTML = `<i data-lucide="play"></i> Start Auto Engine`;
    DOM.btnStartScheduler.innerHTML = `<i data-lucide="play"></i> រត់ Schedule ស្វ័យប្រវត្តិ`;
    DOM.btnToggleEngine.className = 'btn btn-primary';
    DOM.countdownTimer.textContent = '-- : -- : --';
    logMessage(`[ENGINE] Auto Scheduler Engine ត្រូវបានបិទ`, 'info');
  };

  const checkAndRunScheduledPosts = () => {
    const now = new Date();
    
    // Find next upcoming scheduled post
    const scheduledPosts = state.posts.filter(p => p.status === 'scheduled' && p.scheduledTime);
    if (scheduledPosts.length === 0) {
      DOM.countdownTimer.textContent = 'គ្មាន Post Scheduled';
      return;
    }

    // Sort by scheduled time ascending
    scheduledPosts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    const nextPost = scheduledPosts[0];
    const postTime = new Date(nextPost.scheduledTime);

    const diffMs = postTime - now;
    if (diffMs <= 0) {
      // Time to publish!
      executePublishPost(nextPost);
    } else {
      // Update countdown display with hours, minutes, seconds
      const totalSecs = Math.floor(diffMs / 1000);
      const hrs  = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      if (hrs > 0) {
        DOM.countdownTimer.textContent = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      } else {
        DOM.countdownTimer.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      }
    }
  };

  // Switch Preview Sidebar Tabs
  const switchPreviewTab = (tabName) => {
    DOM.previewTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    DOM.tabContentPreview.style.display = tabName === 'preview' ? 'block' : 'none';
    DOM.tabContentScheduler.style.display = tabName === 'scheduler' ? 'block' : 'none';
    DOM.tabContentLogs.style.display = tabName === 'logs' ? 'block' : 'none';
  };

  // Load Sample Demo Data
  const loadDemoData = () => {
    state.posts = [];
    SAMPLE_IMAGES.forEach((sample, idx) => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + ((idx + 1) * 30));
      const isoLocal = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

      const post = createPostObject(sample.url, sample.extras, sample.caption, isoLocal);
      post.status = 'scheduled';
      state.posts.push(post);
    });

    renderPosts();
    renderFBPreview(state.posts[0].id);
    logMessage(`បាន Load ទិន្នន័យ Demo បញ្ចូលក្នុង Campaign ដោយជោគជ័យ!`, 'success');
  };

  // Export Campaign to JSON
  const exportCampaign = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fb_campaign_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logMessage(`បាន Export Campaign ទៅជា JSON File`, 'success');
  };

  // Import Campaign from JSON
  const importCampaign = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.posts && Array.isArray(imported.posts)) state.posts = imported.posts;
        if (imported.destinations && Array.isArray(imported.destinations)) state.destinations = imported.destinations;
        if (imported.settings) state.settings = { ...state.settings, ...imported.settings };

        renderDestinations();
        renderPosts();
        if (state.posts.length > 0) renderFBPreview(state.posts[0].id);
        saveStateToLocalStorage();
        logMessage(`✅ បាន Import Campaign ពី JSON File ដោយជោគជ័យ! (${state.posts.length} Posts)`, 'success');
      } catch (err) {
        alert('ការប្រឡងប្រជែង JSON File បរាជ័យ: ' + err.message);
        logMessage(`Import Campaign Error: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset & Clear All Campaign Data
  const clearAllData = () => {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យ Posts & Campaign ទាំងអស់ឬ?')) {
      state.posts = [];
      localStorage.removeItem('FB_AUTOPOSTER_PERSIST_STATE');
      renderPosts();
      renderFBPreview();
      logMessage('បាន Reset ទិន្នន័យ Campaign ទាំងអស់', 'info');
    }
  };

  // ✨ AI Khmer Caption Generator Engine
  const generateAiCaption = () => {
    const tone = DOM.aiToneSelect.value;
    const prodName = DOM.aiProductName.value.trim() || 'ផលិតផលពិសេស';
    const price = DOM.aiProductPrice.value.trim() || 'តម្លៃសមរម្យ';
    const contact = DOM.aiContactInfo.value.trim() || '012 345 678';

    let captionText = '';
    if (tone === 'promo') {
      captionText = `🔥 ឱកាសពិសេសបញ្ចុះតម្លៃរហូតដល់ ${price}! សម្រាប់ ${prodName}\n\n👉 គុណភាពខ្ពស់ ធានាម៉ូដទាន់សម័យ ទើបតែចូលស្តុកថ្មីៗ។\n🚚 ដឹកជញ្ជូនរហ័សទូទាំង ២៤ ខេត្តក្រុង!\n☎️ ទំនាក់ទំនងកម្ម៉ង់: ${contact}\n\n#promotion #khmershop #cambodia #discount #onlineby`;
    } else if (tone === 'new_arrival') {
      captionText = `✨ NEW ARRIVAL! ${prodName} ម៉ូដថ្មីទើបមកដល់ក្តៅៗ!\n\n💎 ឌីសាញស្អាត ប្រណីត ខ្ពស់ជាងគេ។\n💰 តម្លៃ: ${price}\n📩 ផ្ញើសារចូលប្រអប់សារ ឬ តេមកកាន់: ${contact}\n\n#newarrival #fashion #khmer #style #shop`;
    } else if (tone === 'urgency') {
      captionText = `⚡ ចំនួនមានកំណត់! ជិតអស់ពីស្តុកហើយ! ${prodName}\n\n🏷️ តម្លៃពិសេសត្រឹមតែ: ${price}\n🏃‍♂️ ប្រញាប់ឡើង កម្ម៉ង់ភ្លាមៗ មុនពេលអស់ស្តុក!\n📞 Hotline/Telegram: ${contact}\n\n#limitedstock #hotdeal #promotion #khmer #buyNow`;
    } else if (tone === 'review') {
      captionText = `⭐ ${prodName} - ជម្រើសដ៏ល្អបំផុតសម្រាប់អ្នក!\n\n✔️ គុណភាពធានា ១០០%\n✔️ តម្លៃសមរម្យបំផុត: ${price}\n💬 ផ្តល់ការប្រឹក្សាដោយឥតគិតថ្លៃ\n📲 ទំនាក់ទំនង: ${contact}\n\n#bestquality #review #khmerproduct #shoponline`;
    }

    DOM.aiGeneratedOutput.value = captionText;
    logMessage(`✨ AI បានបង្កើត Caption ប្រភេទ ${tone.toUpperCase()}`, 'success');
  };

  // Event Listeners Setup
  const setupEventListeners = () => {
    // Dropzone Events
    DOM.bulkDropzone.addEventListener('click', () => DOM.bulkFileInput.click());
    DOM.bulkFileInput.addEventListener('change', (e) => handleBulkUploadFiles(e.target.files));

    DOM.bulkDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      DOM.bulkDropzone.classList.add('drag-over');
    });
    DOM.bulkDropzone.addEventListener('dragleave', () => DOM.bulkDropzone.classList.remove('drag-over'));
    DOM.bulkDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      DOM.bulkDropzone.classList.remove('drag-over');
      handleBulkUploadFiles(e.dataTransfer.files);
    });

    // Auto-Schedule Button
    DOM.btnApplyAutoSchedule.addEventListener('click', calculateAutoSchedules);

    // Global Caption Apply Button
    DOM.btnApplyGlobalCaption.addEventListener('click', () => {
      const captionText = DOM.globalCaptionInput.value.trim();
      if (!captionText) {
        alert('សូមបញ្ចូល Caption មុននឹងចុច Apply!');
        return;
      }
      state.posts.forEach((post, idx) => {
        post.caption = captionText.replace('{index}', idx + 1);
      });
      renderPosts();
      renderFBPreview();
      logMessage(`បានដាក់ Caption រួមទៅកាន់ Posts ទាំងអស់!`, 'success');
    });

    // Hashtags Pill click
    document.querySelectorAll('.hashtag-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const tag = e.target.dataset.tag;
        DOM.globalCaptionInput.value += ` ${tag}`;
      });
    });

    // Toolbar Buttons
    DOM.selectAllCheckbox.addEventListener('change', (e) => {
      state.posts.forEach(p => p.selected = e.target.checked);
      renderPosts();
    });

    DOM.btnDeleteSelected.addEventListener('click', () => {
      const selectedCount = state.posts.filter(p => p.selected).length;
      if (selectedCount === 0) return alert('សូមជ្រើសរើស Post ដែលត្រូវលុប!');
      if (confirm(`តើអ្នកពិតជាចង់លុប ${selectedCount} Posts ដែលបានជ្រើសរើសឬ?`)) {
        state.posts = state.posts.filter(p => !p.selected);
        renderPosts();
        renderFBPreview();
        logMessage(`បានលុប ${selectedCount} Posts`, 'info');
      }
    });

    DOM.btnPublishSelected.addEventListener('click', () => {
      const selected = state.posts.filter(p => p.selected);
      if (selected.length === 0) return alert('សូមជ្រើសរើស Post មុននឹងផុស!');
      selected.forEach(post => executePublishPost(post));
    });

    // Filter Tabs
    DOM.filterTabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        DOM.filterTabs.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.activeFilter = e.target.dataset.filter;
        renderPosts();
      });
    });

    // Preview Tabs
    DOM.previewTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        switchPreviewTab(e.currentTarget.dataset.tab);
      });
    });

    // Header Actions
    DOM.btnLoadDemo.addEventListener('click', loadDemoData);
    DOM.btnExportCampaign.addEventListener('click', exportCampaign);

    DOM.btnImportCampaign.addEventListener('click', () => DOM.importCampaignFileInput.click());
    DOM.importCampaignFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importCampaign(e.target.files[0]);
        DOM.importCampaignFileInput.value = '';
      }
    });

    DOM.btnClearAllData.addEventListener('click', clearAllData);

    // Search and Sort Event Listeners
    if (DOM.postSearchInput) {
      DOM.postSearchInput.addEventListener('input', renderPosts);
    }
    if (DOM.postSortSelect) {
      DOM.postSortSelect.addEventListener('change', renderPosts);
    }

    // Light / Dark Theme Toggle
    DOM.btnToggleTheme.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      DOM.btnToggleTheme.innerHTML = isLight
        ? '<i data-lucide="moon"></i>'
        : '<i data-lucide="sun"></i>';
      refreshIcons();
    });

    DOM.btnStartScheduler.addEventListener('click', () => {
      if (state.schedulerRunning) stopSchedulerLoop();
      else startSchedulerLoop();
    });

    DOM.btnToggleEngine.addEventListener('click', () => {
      if (state.schedulerRunning) stopSchedulerLoop();
      else startSchedulerLoop();
    });

    DOM.btnTriggerNow.addEventListener('click', () => {
      const scheduled = state.posts.find(p => p.status === 'scheduled');
      if (scheduled) executePublishPost(scheduled);
      else alert('គ្មាន Scheduled Post សម្រាប់ផុសឡើយ!');
    });

    DOM.btnClearLogs.addEventListener('click', () => {
      DOM.logConsole.innerHTML = '';
      logMessage('Logs cleared.', 'info');
    });

    // Modal Controls
    DOM.btnSettings.addEventListener('click', () => DOM.settingsModal.classList.add('active'));
    DOM.btnManageGroups.addEventListener('click', () => DOM.groupManagerModal.classList.add('active'));
    DOM.btnAddCustomGroupBtn.addEventListener('click', () => DOM.groupManagerModal.classList.add('active'));

    if (DOM.btnOpenAiCaptionModal) {
      DOM.btnOpenAiCaptionModal.addEventListener('click', () => {
        DOM.aiCaptionModal.classList.add('active');
        if (!DOM.aiGeneratedOutput.value) generateAiCaption();
      });
    }

    if (DOM.btnGenerateAiCaption) {
      DOM.btnGenerateAiCaption.addEventListener('click', generateAiCaption);
    }

    if (DOM.btnApplyAiToGlobal) {
      DOM.btnApplyAiToGlobal.addEventListener('click', () => {
        const text = DOM.aiGeneratedOutput.value.trim();
        if (text) {
          DOM.globalCaptionInput.value = text;
          DOM.aiCaptionModal.classList.remove('active');
          logMessage('បានដាក់ AI Caption ចូលក្នុង Global Caption Input', 'success');
        }
      });
    }

    if (DOM.btnApplyAiToAllPosts) {
      DOM.btnApplyAiToAllPosts.addEventListener('click', () => {
        const text = DOM.aiGeneratedOutput.value.trim();
        if (text) {
          state.posts.forEach((post, idx) => {
            post.caption = text.replace('{index}', idx + 1);
          });
          renderPosts();
          renderFBPreview();
          DOM.aiCaptionModal.classList.remove('active');
          logMessage(`បានដាក់ AI Caption លើ Posts ទាំង ${state.posts.length} ដោយជោគជ័យ!`, 'success');
        }
      });
    }

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.settingsModal.classList.remove('active');
        DOM.groupManagerModal.classList.remove('active');
        if (DOM.aiCaptionModal) DOM.aiCaptionModal.classList.remove('active');
      });
    });

    // Save Settings
    DOM.btnSaveSettings.addEventListener('click', () => {
      if (DOM.fbAppIdInput) state.settings.appId = DOM.fbAppIdInput.value.trim();
      state.settings.token = DOM.tokenInput.value;
      state.settings.pageId = DOM.pageIdInput.value;
      state.settings.useSimulation = DOM.useSimulationMode.checked;
      saveStateToLocalStorage();
      DOM.settingsModal.classList.remove('active');
      logMessage('បានរក្សាទុក Settings Facebook API ដោយជោគជ័យ', 'success');
    });

    // Add New Target Group/Page in Modal
    DOM.btnAddGroupModalSubmit.addEventListener('click', () => {
      const name = DOM.newGroupNameInput.value.trim();
      const id = DOM.newGroupIdInput.value.trim();
      const type = DOM.newGroupTypeInput.value;

      if (!name || !id) return alert('សូមបញ្ចូល ឈ្មោះ និង ID ឱ្យបានត្រឹមត្រូវ!');

      state.destinations.push({ id, name, type, selected: true });
      DOM.newGroupNameInput.value = '';
      DOM.newGroupIdInput.value = '';
      renderDestinations();
      logMessage(`បានបន្ថែម Target ${type.toUpperCase()}: ${name}`, 'success');
    });
  };

  // ================================================================
  // FACEBOOK LOGIN MODULE
  // ================================================================

  // Update modal UI based on FB login state
  const updateFBLoginUI = (userData, pagesData) => {
    const loggedOut = document.getElementById('fbLoginLoggedOut');
    const loggedIn  = document.getElementById('fbLoginLoggedIn');
    const modalAvatar  = document.getElementById('modalFbAvatar');
    const modalName    = document.getElementById('modalFbName');
    const modalEmail   = document.getElementById('modalFbEmail');
    const profileBadge = document.getElementById('fbProfileBadge');
    const profileAvatar = document.getElementById('fbProfileAvatar');
    const profileName   = document.getElementById('fbProfileName');
    const pagePicker    = document.getElementById('pagePickerSelect');

    if (userData) {
      state.settings.userData = userData;
      state.settings.pagesData = pagesData;

      // Show logged-in state in modal
      loggedOut.style.display = 'none';
      loggedIn.style.display  = 'block';

      const avatarUrl = `https://graph.facebook.com/${userData.id}/picture?type=normal`;
      modalAvatar.src  = avatarUrl;
      modalName.textContent  = userData.name || '';
      modalEmail.textContent = userData.email || '';

      // Show profile badge in header
      profileBadge.style.display = 'flex';
      profileAvatar.src = avatarUrl;
      profileName.textContent = userData.name || '';

      // Populate page picker from pages
      pagePicker.innerHTML = '<option value="">— ជ្រើសរើស Page —</option>';
      if (pagesData && pagesData.length > 0) {
        pagesData.forEach(page => {
          const opt = document.createElement('option');
          opt.value = page.id;
          opt.textContent = page.name;
          opt.dataset.token = page.access_token || '';
          pagePicker.appendChild(opt);
        });

        // Auto-select first page
        if (pagesData[0]) {
          pagePicker.value = pagesData[0].id;
          DOM.tokenInput.value = pagesData[0].access_token || '';
          DOM.pageIdInput.value = pagesData[0].id;
          state.settings.token = pagesData[0].access_token || '';
          state.settings.pageId = pagesData[0].id;
          state.settings.useSimulation = false;
          DOM.useSimulationMode.checked = false;
          DOM.tokenStatusText.textContent = `✅ Connected as ${userData.name} — Page: ${pagesData[0].name}`;
          logMessage(`✅ Logged in as ${userData.name} — Token auto-filled from Page: ${pagesData[0].name}`, 'success');
        }
      } else {
        pagePicker.innerHTML = '<option value="">— គ្មាន Page ដែលបាន Admin —</option>';
        DOM.tokenStatusText.textContent = `✅ Logged in as ${userData.name} — User token active`;
      }
      saveStateToLocalStorage();
    } else {
      state.settings.userData = null;
      state.settings.pagesData = null;
      // Logged out state
      loggedOut.style.display = 'block';
      loggedIn.style.display  = 'none';
      profileBadge.style.display = 'none';
      pagePicker.innerHTML = '<option value="">— Login ជាមុន ដើម្បីមើលទំព័ររបស់អ្នក —</option>';
      DOM.tokenStatusText.textContent = 'Offline Simulation Mode Active';
      saveStateToLocalStorage();
    }
    refreshIcons();
  };

  // Fetch user profile and pages after successful login
  const fetchFBUserData = (accessToken) => {
    // Fetch user profile
    FB.api('/me', { fields: 'id,name,email', access_token: accessToken }, (userResp) => {
      if (userResp.error) {
        logMessage(`FB API Error: ${userResp.error.message}`, 'error');
        return;
      }
      // Fetch managed pages
      FB.api('/me/accounts', { access_token: accessToken }, (pagesResp) => {
        const pages = (pagesResp && pagesResp.data) ? pagesResp.data : [];
        updateFBLoginUI(userResp, pages);

        // Also auto-populate destinations list with found pages
        pages.forEach(page => {
          const exists = state.destinations.find(d => d.id === page.id);
          if (!exists) {
            state.destinations.push({ id: page.id, name: page.name, type: 'page', selected: true });
          }
        });
        renderDestinations();
      });
    });
  };

  // Global callback used by FB SDK fbAsyncInit
  window.handleFBStatusChange = (response) => {
    if (response.status === 'connected') {
      fetchFBUserData(response.authResponse.accessToken);
    } else {
      updateFBLoginUI(null, null);
    }
  };

  // Page picker change → auto-fill token for selected page
  const pagePicker = document.getElementById('pagePickerSelect');
  if (pagePicker) {
    pagePicker.addEventListener('change', () => {
      const selected = pagePicker.options[pagePicker.selectedIndex];
      if (selected && selected.dataset.token) {
        DOM.tokenInput.value  = selected.dataset.token;
        DOM.pageIdInput.value = selected.value;
        state.settings.token  = selected.dataset.token;
        state.settings.pageId = selected.value;
        logMessage(`Page switched to: ${selected.textContent}`, 'info');
      }
    });
  }

  // Setup FB Login Button, Demo Login, and Logout Button
  const setupFBLoginButtons = () => {
    const appIdNotice = document.getElementById('appIdWarningNotice');

    // Restore saved App ID if present
    if (state.settings.appId && DOM.fbAppIdInput) {
      DOM.fbAppIdInput.value = state.settings.appId;
      window.FB_APP_ID = state.settings.appId;
    }

    // App ID input change handler
    if (DOM.fbAppIdInput) {
      DOM.fbAppIdInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        state.settings.appId = val;
        window.FB_APP_ID = val;
        if (appIdNotice) appIdNotice.style.display = 'none';
        saveStateToLocalStorage();
      });
    }

    // ---- Real FB OAuth Login Button ----
    document.getElementById('btnFBLogin').addEventListener('click', () => {
      const inputAppId = DOM.fbAppIdInput ? DOM.fbAppIdInput.value.trim() : '';
      const activeAppId = inputAppId || window.FB_APP_ID;

      // Strict validation: App ID must exist and not be '0' or default string
      if (!activeAppId || activeAppId === '0' || activeAppId.length < 5) {
        if (appIdNotice) appIdNotice.style.display = 'block';
        if (DOM.fbAppIdInput) {
          DOM.fbAppIdInput.style.borderColor = '#ef4444';
          DOM.fbAppIdInput.focus();
        }
        logMessage('⚠️ មិនអាច Login បានទេ: ត្រូវការ Facebook App ID ត្រឹមត្រូវ', 'error');
        return;
      }

      if (appIdNotice) appIdNotice.style.display = 'none';
      if (DOM.fbAppIdInput) DOM.fbAppIdInput.style.borderColor = 'var(--border-color)';

      if (!window.FB) {
        alert('Facebook SDK មិនទាន់ Load ទេ! សូមពិនិត្យមើល Internet របស់អ្នក រួចព្យាយាមម្ដងទៀត។');
        return;
      }

      window.FB_APP_ID = activeAppId;
      try {
        FB.init({ appId: window.FB_APP_ID, cookie: true, xfbml: true, version: 'v20.0' });
      } catch (err) {
        console.warn('FB Init:', err);
      }

      logMessage('កំពុងភ្ជាប់ទៅកាន់ Facebook OAuth...', 'info');

      FB.login((response) => {
        if (response && response.authResponse) {
          logMessage('Facebook Login successful! Fetching profile & pages...', 'success');
          fetchFBUserData(response.authResponse.accessToken);
        } else {
          logMessage('Facebook Login: សូមពិនិត្យមើល App ID របស់អ្នក ឬ ប្រើ Demo Login!', 'error');
        }
      }, {
        scope: 'public_profile'
      });
    });

    // ---- Direct Access Token Connect Button ----
    const btnConnectViaToken = document.getElementById('btnConnectViaToken');
    if (btnConnectViaToken) {
      btnConnectViaToken.addEventListener('click', () => {
        const token = DOM.tokenInput.value.trim();
        const pageId = DOM.pageIdInput.value.trim();

        if (!token) {
          alert('សូមបញ្ចូល Access Token ជាមុនសិន!');
          DOM.tokenInput.focus();
          return;
        }

        state.settings.token = token;
        if (pageId) state.settings.pageId = pageId;
        state.settings.useSimulation = false;
        if (DOM.useSimulationMode) DOM.useSimulationMode.checked = false;

        // Try to fetch profile details using the provided token directly
        fetch(`https://graph.facebook.com/v20.0/me?fields=id,name,email&access_token=${encodeURIComponent(token)}`)
          .then(res => res.json())
          .then(user => {
            if (user && user.name) {
              updateFBLoginUI(user, [{ id: pageId || 'custom_page', name: 'Connected Page', access_token: token }]);
              logMessage(`✅ Connected via direct Token as: ${user.name}`, 'success');
            } else {
              // Custom Token connected
              const customUser = { id: 'usr_token', name: 'Token User', email: 'Connected via Token' };
              updateFBLoginUI(customUser, [{ id: pageId || 'custom_page', name: 'Custom Page Target', access_token: token }]);
              logMessage('✅ Connected via direct Access Token', 'success');
            }
            saveStateToLocalStorage();
          })
          .catch(() => {
            const customUser = { id: 'usr_token', name: 'Token User', email: 'Token Active' };
            updateFBLoginUI(customUser, [{ id: pageId || 'custom_page', name: 'Custom Page Target', access_token: token }]);
            logMessage('✅ Access Token configuration saved.', 'success');
            saveStateToLocalStorage();
          });
      });
    }

    // ---- Save Page Profile Button ----
    const btnSavePageProfile = document.getElementById('btnSavePageProfile');
    if (btnSavePageProfile) {
      btnSavePageProfile.addEventListener('click', () => {
        const token = DOM.tokenInput.value.trim();
        const pageId = DOM.pageIdInput.value.trim();

        if (!token || !pageId) {
          alert('សូមបញ្ចូល Access Token និង Page ID ឱ្យបានត្រឹមត្រូវ!');
          return;
        }

        const pageName = prompt('សូមបញ្ចូលឈ្មោះសម្គាល់ Page នេះ (ឧ. Sokha Fashion Store) ៖', `Page ${pageId.slice(-4)}`);
        if (!pageName) return;

        // Check if page profile already exists
        const existingIdx = state.savedPages.findIndex(p => p.pageId === pageId);
        if (existingIdx >= 0) {
          state.savedPages[existingIdx] = { name: pageName, pageId, token };
        } else {
          state.savedPages.push({ name: pageName, pageId, token });
        }

        saveStateToLocalStorage();
        renderSavedPages();
        logMessage(`💾 បាន Save Page Profile: ${pageName} ចូលក្នុងបញ្ជីដោយជោគជ័យ!`, 'success');
      });
    }

    // ---- Quick Demo Login Button ----
    if (DOM.btnDemoFBLogin) {
      DOM.btnDemoFBLogin.addEventListener('click', () => {
        const demoUser = {
          id: 'demo_1009827394',
          name: 'Sokha Online Store (Admin)',
          email: 'sokha.admin@example.com'
        };

        const demoPages = [
          { id: 'p_201', name: 'Sokha Fashion Cambodia (Official Page)', access_token: 'EAAG_DEMO_TOKEN_FA5H10N_2026' },
          { id: 'p_202', name: 'PP Electronic & Smart Gadgets', access_token: 'EAAG_DEMO_TOKEN_TECH_2026' },
          { id: 'p_203', name: 'Khmer Express Logistics Page', access_token: 'EAAG_DEMO_TOKEN_EXPRESS_2026' }
        ];

        updateFBLoginUI(demoUser, demoPages);

        // Auto-add demo pages to destinations list
        demoPages.forEach(p => {
          if (!state.destinations.find(d => d.id === p.id)) {
            state.destinations.push({ id: p.id, name: p.name, type: 'page', selected: true });
          }
        });

        renderDestinations();
        logMessage(`✅ Connected as Demo Profile: ${demoUser.name}`, 'success');
      });
    }

    // ---- Logout Button ----
    document.getElementById('btnFBLogout').addEventListener('click', () => {
      if (window.FB) {
        try { FB.logout(); } catch(e){}
      }
      updateFBLoginUI(null, null);
      state.settings.token = '';
      state.settings.pageId = '';
      state.settings.useSimulation = true;
      DOM.useSimulationMode.checked = true;
      DOM.tokenInput.value  = '';
      DOM.pageIdInput.value = '';
      logMessage('Logged out from Facebook.', 'info');
    });
  };

  // App Initialization
  const init = () => {
    initDefaultTime();
    const hasSavedState = loadStateFromLocalStorage();
    renderDestinations();
    renderPosts();
    renderFBPreview();
    setupEventListeners();
    setupFBLoginButtons();
    refreshIcons();
    if (hasSavedState) {
      logMessage(`FB AutoPoster Pro App Initialized. Loaded ${state.posts.length} saved posts from local session.`, 'success');
    } else {
      logMessage('FB AutoPoster Pro App Initialized. Ready to post!', 'info');
    }
  };

  init();
});
