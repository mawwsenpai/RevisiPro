//<![CDATA[
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', event => {
        if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input') {
            return; 
        }
        event.preventDefault(); 
    });

    const doc = document;
    const root = doc.documentElement;
    let firebaseApp, auth, database, provider;
    let currentUser = null;
    let onlineStatus = {};
    let profiles = {};
    const config = {
        novelGenres: ['Fantasi', 'Fiksi Ilmiah', 'Romansa', 'Horor', 'Thriller', 'Misteri', 'Petualangan', 'Sejarah', 'Humor', 'Sastra', 'Aksi', 'Drama', 'Slice of Life', 'Psikologis', 'Komedi', 'Fan-Fiction', 'Young Adult', 'New Adult'],
        fontList: [
            'Poppins', 'JetBrains Mono', 'Sora', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Merriweather',
            'Nunito', 'Playfair Display', 'Oswald', 'Raleway', 'Ubuntu', 'Source Code Pro', 'Fira Code',
            'Cormorant Garamond', 'EB Garamond', 'Arvo', 'Lora', 'PT Serif', 'Crimson Text', 'Quicksand',
            'Josefin Sans', 'Pacifico', 'Caveat', 'Inter', 'Manrope', 'DM Sans', 'Space Grotesk', 'Work Sans',
            'Rubik', 'Karla', 'Inconsolata', 'Anonymous Pro', 'Cutive Mono', 'Syne', 'Lexend', 'Outfit',
            'Zilla Slab', 'IBM Plex Sans', 'IBM Plex Mono', 'Cardo', 'Alegreya', 'Alegreya Sans', 'Chivo',
            'Domine', 'Gentium Book Plus', 'Vollkorn', 'Bitter', 'Taviraj', 'Rakkas', 'Kreon', 'BioRhyme',
            'Cinzel', 'Fauna One', 'Philosopher', 'Quattrocento', 'Sanchez', 'Exo 2', 'Orbitron', 'Rajdhani',
            'Abel', 'Barlow', 'Cabin', 'Fjalla One', 'Heebo', 'Hind', 'Kanit', 'Maven Pro', 'Mada', 'Noto Sans',
            'Oxygen', 'Pontano Sans', 'Questrial', 'Signika', 'Titillium Web', 'Yantramanav', 'Amaranth',
            'Bree Serif', 'Fredoka One', 'Lobster', 'Patua One', 'Righteous', 'Russo One', 'Varela Round',
            'Jura', 'Major Mono Display', 'Megrim', 'Monoton', 'Nova Mono', 'Share Tech Mono', 'VT323'
        ]
    };
    const LOCAL_STORAGE_KEY_PROFILE = 'revisiProProfile_v5';
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyBvWOW46b0zJ3zmUp4fSUyaw1VnNvxCF60",
        authDomain: "revisipro-6dd30.firebaseapp.com",
        projectId: "revisipro-6dd30",
        databaseURL: "https://revisipro-6dd30-default-rtdb.asia-southeast1.firebasedatabase.app"
    };
    const DROPBOX_CONFIG = {
        appKey: "ilqrg4p3g077kh8",
        appSecret: "sh8yz7g6fmafkr1",
        redirectUri: "https://revisinovelpremium.blogspot.com",
        accessToken: null,
        dropboxClient: null,
    };
    const GEMINI_API_KEY = "AIzaSyA7ClfQHZBGB7Qu-vJeiheRBe1diostcB8";

    const el = {
        root: doc.documentElement, body: doc.body,
        mainHeaderTitle: doc.getElementById('main-header-title-input'),
        sidebar: doc.getElementById('app-sidebar'), overlay: doc.getElementById('sidebar-overlay'),
        novelInput: doc.getElementById('novel-input'),
        revisionOutput: doc.getElementById('revision-output'),
        decrEditorFontBtn: doc.getElementById('decr-editor-font'), incrEditorFontBtn: doc.getElementById('incr-editor-font'),
        currentEditorFontSize: doc.getElementById('current-editor-font-size'),
        mainViews: doc.querySelectorAll('.main-view'),
        novelListScroller: doc.getElementById('novel-list-scroller'),
        novelDetailView: doc.getElementById('novel-detail-view'),
        chapterList: doc.getElementById('chapter-list'), chapterEditorView: doc.getElementById('chapter-editor-view'),
        saveChapterBtn: doc.getElementById('save-chapter-btn'),
        addCharacterBtn: doc.getElementById('add-character-btn'),
        additionalCharactersContainer: doc.getElementById('generate-additional-characters'),
        editorGrid: doc.getElementById('editor-grid'),
        viewOriginalBtn: doc.getElementById('view-original-btn'),
        viewRevisiBtn: doc.getElementById('view-revisi-btn'),
        panelOriginal: doc.getElementById('panel-original'),
        panelRevisi: doc.getElementById('panel-revisi'),
        editorFooterStats: doc.getElementById('editor-footer-stats'),
        animatedBg: doc.getElementById('animated-bg'),
        bubblesContainer: doc.getElementById('bubbles-container'),
        backupRestoreLinkContainer: doc.getElementById('backup-restore-link-container'),
        shootingStarsContainer: doc.getElementById('shooting-stars-container'),
        blinkingStarsContainer: doc.getElementById('blinking-stars-container'),
        fireParticlesContainer: doc.getElementById('fire-particles-container'),
        loginLinkContainer: doc.getElementById('login-link-container'),
        userProfileLinkContainer: doc.getElementById('user-profile-link-container'),
        communityLinkContainer: doc.getElementById('community-link-container'),
        communityLoginStatus: doc.getElementById('community-login-status'),
        communityChatBox: doc.getElementById('community-chat-box'),
        communityChatInputWrapper: doc.getElementById('community-chat-input-wrapper'),
        chatInput: doc.getElementById('chat-input'),
        systemFontSizeSlider: doc.getElementById('system-font-size-slider'),
        quickReviseBtn: doc.getElementById('quick-revise-btn'),
        quickReviseModal: doc.getElementById('quick-revisi-modal'),
        confirmQuickReviseBtn: doc.getElementById('confirm-quick-revise-btn'),
        activityList: doc.getElementById('activity-list'),
        exclusiveThemesContainer: doc.getElementById('exclusive-themes-container'),
        exclusiveAnimationsContainer: doc.getElementById('exclusive-animations-container'),
        loginForThemesPrompt: doc.getElementById('login-for-themes-prompt'),
        loginForAnimationsPrompt: doc.getElementById('login-for-animations-prompt'),
        onlineUsersList: doc.getElementById('online-users'),
        downloadLinkContainer: doc.getElementById('download-app-link-container'),
        offlineUsersList: doc.getElementById('offline-users')
    };

    let state = {
        activeNovelId: null, activeChapterId: null, editorFontSize: 16, systemFontSize: 16,
        notificationTimeout: null,
        localData: JSON.parse(localStorage.getItem('revisiProData_v5')) || { novels: [] },
        itemToDelete: { type: null, id: null, parentId: null },
        isEditorDirty: false,
        isSaving: false,
        isSyncing: false,
        autoSaveInterval: null,
        messageListenerAttached: false,
        longPressTimer: null,
        chatMessages: [],
        dropboxAuthorized: false
    };

    let modals = {};

    const isAndroidApp = () => {
        return typeof Android !== 'undefined' && typeof Android.startGoogleLogin === 'function';
    };

    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };
    const methods = {
    showLoading: (text = "Memuat...") => {
        const loadingOverlay = doc.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.querySelector('.loading-text').textContent = text;
            loadingOverlay.classList.add('is-open');
        }
    },
    callDropboxApi: async (dropboxFunction, args) => {
        if (!state.dropboxAuthorized || !DROPBOX_CONFIG.dropboxClient) {
            methods.showNotification("Cloud tidak terhubung.", "error");
            throw new Error("Dropbox client is not initialized.");
        }
        try {
            return await dropboxFunction(args);
        } catch (error) {
            if (error && error.status === 401) {
                console.error("Dropbox token is invalid or expired. Re-authentication needed.");
                if (currentUser) {
                    localStorage.removeItem(`dropbox_auth_${currentUser.uid}`);
                    database.ref(`profiles/${currentUser.uid}/dropboxToken`).remove();
                }
                state.dropboxAuthorized = false;
                DROPBOX_CONFIG.dropboxClient = null;
                methods.showNotification("Koneksi Dropbox terputus. Harap hubungkan ulang.", 4000);
                methods.authenticateWithDropbox(true);
                throw new Error("Authentication failed. Please re-connect to Dropbox.");
            } else {
                console.error("An error occurred with the Dropbox API:", error);
                throw error;
            }
        }
    },
    checkDropboxAuth: () => {
        return state.dropboxAuthorized;
    },
    promptForDropboxAuth: (featureName) => {
        const modal = modals.requireApp;
        modal.querySelector('.modal-title').innerHTML = `<i class='fab fa-dropbox' style='color: var(--accent-color);'></i> <span>Fitur Memerlukan Dropbox</span>`;
        modal.querySelector('.modal-body p').innerHTML = `Untuk menggunakan fitur <b>${featureName}</b>, Anda perlu menghubungkan akun Dropbox terlebih dahulu untuk menyimpan file.`;
        const buttonContainer = modal.querySelector('.modal-body > div');
        buttonContainer.innerHTML = `
            <button class='app-button outline' data-action='close-modal' style="text-decoration: none;">Nanti Saja</button>
            <button class='app-button primary' id='connect-dropbox-now-btn-dynamic'>
                <i class='fab fa-dropbox'></i> Hubungkan Sekarang
            </button>`;
        modal.querySelector('#connect-dropbox-now-btn-dynamic').addEventListener('click', () => {
            methods.hideModal(modal);
            methods.authenticateWithDropbox(true);
        }, {
            once: true
        });
        methods.showModal(modal);
    },
ensureFolderExists: async (path) => {
    try {
        const dbx = DROPBOX_CONFIG.dropboxClient;
        await methods.callDropboxApi(
            dbx.filesCreateFolderV2.bind(dbx),
            { path: path, autorename: false }
        );
    } catch (error) {
        if (error.status === 409 && error.error?.error_summary.startsWith('path/conflict/folder')) {
            return; // Folder sudah ada, aman.
        }
        throw error; // Error lain yang lebih serius
    }
},
getOrCreatePermanentLink: async (path) => {
    const dbx = DROPBOX_CONFIG.dropboxClient;
    try {
        const response = await methods.callDropboxApi(
            dbx.sharingListSharedLinks.bind(dbx), { path: path, direct_only: true }
        );

        let link;
        if (response.result.links.length > 0) {
            link = response.result.links[0].url;
        } else {
            const newLinkResponse = await methods.callDropboxApi(
                dbx.sharingCreateSharedLinkWithSettings.bind(dbx), { path: path }
            );
            link = newLinkResponse.result.url;
        }
        return link
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace('?dl=0', '');
    } catch (error) {
        console.error('Gagal membuat atau mendapatkan permanent link:', error);
        throw error;
    }
},
    hideLoading: () => doc.getElementById('loading-overlay')?.classList.remove('is-open'),
    showModal: (modal) => {
        if (!modal) return;
        const openModal = doc.querySelector('.modal.is-open');
        if (openModal && openModal !== modal) {
            openModal.classList.remove('is-open');
        }
        modal.classList.add('is-open');
        if (modal.id === 'delete-confirm-modal' || modal.id === 'profile-modal') {
            modal.style.zIndex = '9002';
        } else {
            modal.style.zIndex = '9000';
        }
        if (window.innerWidth <= 768 && el.sidebar.classList.contains('is-open')) {
            el.sidebar.classList.remove('is-open');
        }
    },
    showProgressPanel: (title, initialMessage) => {
        const existingPanel = document.getElementById('progress-panel-dynamic');
        if (existingPanel) { existingPanel.remove(); }
        const panel = document.createElement('div');
        panel.id = 'progress-panel-dynamic';
        panel.className = 'modal is-open';
        const modalPanel = document.createElement('div');
        modalPanel.className = 'modal-panel';
        modalPanel.style.maxWidth = '400px';
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        modalHeader.appendChild(modalTitle);
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.style.display = 'flex';
        modalBody.style.alignItems = 'center';
        modalBody.style.gap = '1.5rem';
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        const message = document.createElement('p');
        message.id = 'progress-panel-message';
        message.textContent = initialMessage;
        modalBody.appendChild(spinner);
        modalBody.appendChild(message);
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        const hideBtn = document.createElement('button');
        hideBtn.className = 'app-button outline';
        hideBtn.textContent = 'Sembunyikan';
        modalFooter.appendChild(hideBtn);
        modalPanel.appendChild(modalHeader);
        modalPanel.appendChild(modalBody);
        modalPanel.appendChild(modalFooter);
        panel.appendChild(modalPanel);
        const close = () => { panel.remove(); };
        const update = (newMessage, status) => {
            message.textContent = newMessage;
            spinner.style.borderLeftColor = 'var(--accent-color)';
            spinner.style.animation = 'spin 1s linear infinite';
            if (status === 'success') {
                spinner.style.borderColor = '#28a745';
                spinner.style.animation = 'none';
            } else if (status === 'error') {
                spinner.style.borderColor = 'var(--danger-color)';
                spinner.style.animation = 'none';
            }
        };
        hideBtn.addEventListener('click', close);
        document.body.appendChild(panel);
        return { update, close };
    },
    hideModal: (modal) => modal?.classList.remove('is-open'),
    showNotification: (msg, dur = 3000) => {
        let notification = doc.getElementById('floating-notification');
        if (!notification) {
            notification = doc.createElement('div');
            notification.id = 'floating-notification';
            notification.className = 'floating-notification';
            notification.innerHTML = `<span></span>`;
            doc.body.appendChild(notification);
        }
        clearTimeout(state.notificationTimeout);
        notification.querySelector('span').textContent = msg;
        notification.classList.remove('hide');
        notification.classList.add('show');
        if (dur > 0) {
            state.notificationTimeout = setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.add('hide');
            }, dur);
        }
    },
    showConfirmModal: (title, message) => {
        return new Promise(resolve => {
            const existingModal = document.getElementById('confirm-modal-dynamic');
            if (existingModal) { existingModal.remove(); }
            const modal = document.createElement('div');
            modal.id = 'confirm-modal-dynamic';
            modal.className = 'modal';
            const modalPanel = document.createElement('div');
            modalPanel.className = 'modal-panel';
            modalPanel.style.maxWidth = '450px';
            const modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            const modalTitle = document.createElement('h3');
            modalTitle.className = 'modal-title';
            modalTitle.textContent = title;
            modalHeader.appendChild(modalTitle);
            const modalBody = document.createElement('div');
            modalBody.className = 'modal-body';
            const modalMessage = document.createElement('p');
            modalMessage.textContent = message;
            modalBody.appendChild(modalMessage);
            const modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modalFooter.style.justifyContent = 'flex-end';
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'app-button outline';
            cancelBtn.textContent = 'Batal';
            const okBtn = document.createElement('button');
            okBtn.className = 'app-button primary';
            okBtn.textContent = 'Ya, Lanjutkan';
            modalFooter.appendChild(cancelBtn);
            modalFooter.appendChild(okBtn);
            modalPanel.appendChild(modalHeader);
            modalPanel.appendChild(modalBody);
            modalPanel.appendChild(modalFooter);
            modal.appendChild(modalPanel);
            const cleanupAndClose = (result) => {
                modal.remove();
                resolve(result);
            };
            okBtn.addEventListener('click', () => cleanupAndClose(true));
            cancelBtn.addEventListener('click', () => cleanupAndClose(false));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) { cleanupAndClose(false); }
            });
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('is-open'), 10);
        });
    },
    updateStats: (textarea) => {
        if (!textarea || !el.editorFooterStats) return;
        const text = textarea.value, charCount = text.length;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        el.editorFooterStats.textContent = `${wordCount.toLocaleString('id-ID')} Kata, ${charCount.toLocaleString('id-ID')} Karakter`;
    },
    clearNovelDetailView: () => {
        doc.getElementById('novel-title').textContent = '';
        doc.getElementById('novel-cover-img').src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        doc.getElementById('novel-description').textContent = 'Memuat deskripsi...';
        doc.getElementById('chapter-list').innerHTML = '<p style="padding: 0 var(--padding-md); color: var(--text-secondary);">Memuat bab...</p>';
        doc.getElementById('novel-stats-chapters').innerHTML = '<i class="fas fa-book"></i> ...';
        doc.getElementById('novel-stats-words').innerHTML = '<i class="fas fa-keyboard"></i> ...';
        doc.getElementById('novel-stats-genre').innerHTML = '<i class="fas fa-tags"></i> <span>...</span>';
    },
    applyEditorFontSize: (newSize) => {
        state.editorFontSize = Math.max(10, Math.min(30, newSize));
        const sizeRem = `${state.editorFontSize / 16}rem`;
        root.style.setProperty('--font-size-editor', sizeRem);
        el.currentEditorFontSize.textContent = `${state.editorFontSize}px`;
        localStorage.setItem('userEditorFontSize', state.editorFontSize);
    },
    getSingleLocalNovel: (novelId) => state.localData.novels.find(p => String(p.id) === String(novelId)),
    getLocalNovels: () => state.localData.novels,
    
    deleteFileFromDropbox: async (path) => {
    if (!path) return;
    const dbx = DROPBOX_CONFIG.dropboxClient;
    try {
        await methods.callDropboxApi(
            dbx.filesDeleteV2.bind(dbx),
            { path: path }
        );
        console.log(`File berhasil dihapus: ${path}`);
    } catch (error) {
        if (error.status === 409 && error.error?.error_summary.includes('path_lookup/not_found')) {
            console.log("File lama tidak ditemukan di Dropbox, tidak perlu dihapus.");
        } else {
            throw error;
        }
    }
},
    uploadFileToDropbox: async (fullPath, fileContent) => {
        const dbx = DROPBOX_CONFIG.dropboxClient;
        const response = await methods.callDropboxApi(dbx.filesUpload.bind(dbx), {
            path: fullPath, contents: fileContent, mode: { '.tag': 'overwrite' }, autorename: false
        });
        return response.result;
    },
    saveLocalData: () => {
        try {
            const dataToSave = JSON.stringify(state.localData);
            localStorage.setItem('revisiProData_v5', dataToSave);
            return true;
        } catch (e) {
            methods.showNotification("Gagal menyimpan. Memori penuh?", "error");
            return false;
        }
    },
    handleAutoSave: () => {
        if (state.isEditorDirty) {
            methods.saveCurrentChapter(true);
        }
    },
    saveCurrentChapter: (isAutoSave = false) => {
    if (state.isSaving || !state.activeNovelId) return;
    
    try {
        state.isSaving = true;
        const novelId = state.activeNovelId;
        const isNewChapter = state.activeChapterId === null;
        const chapterId = isNewChapter ? Date.now() : state.activeChapterId;
        if (isNewChapter) { state.activeChapterId = chapterId; }
        
        const chapterData = {
            chapterId: chapterId,
            chapterTitle: el.mainHeaderTitle.value.trim() || "Bab Tanpa Judul",
            text: el.novelInput.value,
            lastUpdated: Date.now(),
        };
        
        const novel = methods.getSingleLocalNovel(novelId);
        if (!novel) throw new Error("Novel induk tidak ditemukan.");
        
        const chapterIndex = novel.chapters.findIndex(c => c.chapterId === chapterId);
        if (chapterIndex > -1) {
            novel.chapters[chapterIndex] = { ...novel.chapters[chapterIndex], ...chapterData };
        } else {
            novel.chapters.push(chapterData);
        }
        
        novel.lastUpdated = Date.now();
        if (!isAutoSave) {
            methods.addActivity('fas fa-save', `Menyimpan bab "${chapterData.chapterTitle}"`);
        }
        
        methods.saveLocalData();
        state.isEditorDirty = false;
        
        if (!isAutoSave) methods.showNotification("Bab disimpan.");
        
        methods.syncQueue.add(novelId);
        
    } catch (error) {
        if (!isAutoSave) methods.showNotification(`Gagal menyimpan: ${error.message}`, "error");
    } finally {
        state.isSaving = false;
    }
},
    sanitizeForFilename: (text) => {
        return text
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .substring(0, 50);
    },
    renderView: (viewId, fromPopState = false) => {
    if (state.autoSaveInterval) {
        clearInterval(state.autoSaveInterval);
        state.autoSaveInterval = null;
    }
    if (!fromPopState) {
        history.pushState(null, '', '#' + viewId);
    }
    el.mainViews.forEach(v => {
        v.classList.remove('active');
    });
    doc.getElementById(viewId)?.classList.add('active');
    doc.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = doc.querySelector(`a[data-view='${viewId}']`);
    if (activeLink) activeLink.classList.add('active');
    if (window.innerWidth <= 768) el.sidebar.classList.remove('is-open');
    const viewTitles = {
        'app-dashboard': 'Dashboard',
        'community-view': 'Komunitas',
        'user-profile-view': 'Profil Saya'
    };
    document.title = (viewTitles[viewId] ? `${viewTitles[viewId]} - Noveler Pro` : 'Noveler Pro');
    if (viewId === 'app-dashboard') methods.renderDashboard();
    if (viewId === 'community-view') methods.initCommunityView();
    if (viewId === 'user-profile-view') methods.showProfile();
    if (viewId === 'chapter-editor-view') {
        state.autoSaveInterval = setInterval(methods.handleAutoSave, 1500);
    }
},
    renderDashboard: async () => {
    const isInitialSyncDone = sessionStorage.getItem('initialSyncDone');
    
    if (methods.checkDropboxAuth() && !isInitialSyncDone) {
        methods.showLoading("Sinkronisasi...");
        try {
            const dbx = DROPBOX_CONFIG.dropboxClient;
            const novelFolders = await methods.listFilesInDropboxFolder('/Novel/');
            
            const novelPromises = novelFolders
                .filter(entry => entry['.tag'] === 'folder')
                .map(async (folder) => {
                    try {
                        const dataPath = `${folder.path_lower}/data.json`;
                        const fileContentResponse = await methods.callDropboxApi(
                            dbx.filesDownload.bind(dbx), { path: dataPath }
                        );
                        const fileText = await fileContentResponse.result.fileBlob.text();
                        const novelMetadata = JSON.parse(fileText);
                        const localNovel = methods.getSingleLocalNovel(novelMetadata.id);
                        if (localNovel && localNovel.lastUpdated > novelMetadata.lastUpdated) {
                            return localNovel;
                        }
                        return await methods.fetchFullNovelDataFromCloud(novelMetadata.id, novelMetadata);
                        
                    } catch (e) {
                        return null;
                    }
                });
            
            const cloudNovels = (await Promise.all(novelPromises)).filter(Boolean);
            state.localData.novels = cloudNovels;
            methods.saveLocalData();
            
        } catch (error) {
            methods.showNotification("Sinkronisasi gagal.", "error");
        } finally {
            methods.hideLoading();
            sessionStorage.setItem('initialSyncDone', 'true');
        }
    }
    
    const novels = methods.getLocalNovels();
    novels.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    
    const createNovelCardHTML = `<div class='novel-card create-novel-card' data-modal-target='createNovel'><i class='fas fa-plus'></i><p>Buat Novel Baru</p></div>`;
    const novelCardsHTML = novels.map(novel => {
        const chapterCount = novel.chapters?.length || 0;
        const totalWords = novel.chapters?.reduce((sum, ch) => sum + (ch.text?.trim().split(/\s+/).filter(Boolean).length || 0), 0) || 0;
        const coverPlaceholderSVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="100%" height="100%" fill="%23161b22"/><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24">No Cover</text></svg>';
        const coverSrc = novel.coverImage || coverPlaceholderSVG;
        return `
        <div class='novel-card' data-id='${novel.id}'>
            <button class="delete-button" data-delete-type="novel" data-id="${novel.id}" title="Hapus Novel"><i class="fas fa-trash-alt"></i></button>
            <div class="novel-card-cover"><img src='${coverSrc}' alt='Cover'/><button class="edit-icon" data-modal-target="editNovel" data-id="${novel.id}"><i class="fas fa-edit"></i></button></div>
            <div class="novel-card-info">
                <h4 class="novel-card-title">${novel.projectTitle}</h4>
                <div class="novel-card-stats">
                    <span><i class="fas fa-book"></i> ${chapterCount} Bab</span>
                    <span><i class="fas fa-keyboard"></i> ${totalWords.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>`;
    }).join('');
    
    el.novelListScroller.innerHTML = novelCardsHTML + createNovelCardHTML;
    methods.renderActivities();
},
renderNovelDetail: (novelId) => {
    methods.renderView('novel-detail-view');
    methods.clearNovelDetailView();
    
    const id = Number(novelId);
    state.activeNovelId = id;
    
    const novelToRender = methods.getSingleLocalNovel(id);
    
    if (!novelToRender) {
        return methods.renderView('app-dashboard');
    }
    
    methods.updateNovelDetailUI(novelToRender);
},
    resetCreateNovelForm: () => {
        doc.getElementById('new-novel-title').value = '';
        doc.getElementById('new-novel-desc').value = '';
        doc.getElementById('new-novel-cover').value = '';
        const previewImg = doc.querySelector('#create-novel-modal .cover-uploader img');
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        doc.querySelectorAll('#new-novel-genres input:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
    },
updateNovelDetailUI: async (novelData) => {
    if (!novelData) return;
    
    document.title = `${novelData.projectTitle} - Noveler Pro`;
    doc.getElementById('novel-title').textContent = novelData.projectTitle;
    const coverPlaceholderSVGDetail = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="180" viewBox="0 0 120 180"><rect width="100%" height="100%" fill="%23161b22"/><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12">No Cover</text></svg>';
    doc.getElementById('novel-cover-img').src = novelData.coverImage || coverPlaceholderSVGDetail;
    doc.getElementById('novel-description').textContent = novelData.description || 'Tidak ada deskripsi.';
    doc.getElementById('novel-stats-genre').innerHTML = `<i class='fas fa-tags'></i> <span>${(novelData.genres || []).join(', ') || 'N/A'}</span>`;
    
    const chapterListContainer = el.chapterList;
    chapterListContainer.innerHTML = '<p style="padding: 0 var(--padding-md); color: var(--text-secondary);">Memuat daftar bab...</p>';
    
    const chaptersMetadata = novelData.chapters || [];
    
    if (chaptersMetadata.length === 0) {
        chapterListContainer.innerHTML = '<p style="padding: 0 var(--padding-md); color: var(--text-secondary);">Belum ada bab di novel ini.</p>';
        doc.getElementById('novel-stats-chapters').innerHTML = `<i class="fas fa-book"></i> 0 Bab`;
        doc.getElementById('novel-stats-words').innerHTML = `<i class="fas fa-keyboard"></i> 0 Kata`;
        return;
    }
    
    const chapterPromises = chaptersMetadata.map(async (chapterMeta) => {
        if (chapterMeta.text) {
            return chapterMeta;
        }
        if (!chapterMeta.url) {
            return { ...chapterMeta, text: null, error: "Data chapter tidak ditemukan (URL kosong)." };
        }
        try {
            const response = await fetch(chapterMeta.url);
            if (!response.ok) {
                throw new Error(`Gagal memuat: Status ${response.status}`);
            }
            const chapterContent = await response.json();
            return chapterContent;
        } catch (e) {
            return { ...chapterMeta, text: null, error: "Link rusak atau file tidak ditemukan di Dropbox." };
        }
    });
    
    const fetchedChapters = await Promise.all(chapterPromises);
    
    novelData.chapters = fetchedChapters;
    methods.saveLocalData();
    
    chapterListContainer.innerHTML = '';
    let calculatedTotalWords = 0;
    
    fetchedChapters.sort((a, b) => (b.chapterId || 0) - (a.chapterId || 0));
    
    fetchedChapters.forEach((chapter, index) => {
        let chapterItemHTML = '';
        const chapterNumber = fetchedChapters.length - index;
        
        if (chapter.error) {
            chapterItemHTML = `
            <div class='chapter-item' style="border-color: var(--danger-color); opacity: 0.7;">
                <div class="chapter-info" style="flex-direction: column; align-items: flex-start;">
                    <span class="chapter-number" style="color: var(--danger-color);">${chapterNumber}</span>
                    <p class="chapter-title" style="font-style: italic;">${chapter.chapterTitle || 'Gagal Memuat Judul'}</p>
                    <small style="color: var(--danger-color);">${chapter.error}</small>
                </div>
                <button class="delete-button" data-delete-type="chapter" data-id="${chapter.chapterId}" data-parent-id="${novelData.id}" title="Hapus Bab"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        } else {
            const wordCount = (chapter.text || '').trim().split(/\s+/).filter(Boolean).length;
            calculatedTotalWords += wordCount;
            
            chapterItemHTML = `
            <div class='chapter-item' data-chapter-id='${chapter.chapterId}'>
                <a href='#' class="chapter-link">
                    <div class="chapter-info">
                        <span class="chapter-number">${chapterNumber}</span>
                        <p class="chapter-title">${chapter.chapterTitle}</p>
                    </div>
                </a>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="chapter-meta">${wordCount.toLocaleString('id-ID')} Kata</span>
                    <button class="delete-button" data-delete-type="chapter" data-id="${chapter.chapterId}" data-parent-id="${novelData.id}" title="Hapus Bab"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>`;
        }
        chapterListContainer.innerHTML += chapterItemHTML;
    });
    
    doc.getElementById('novel-stats-chapters').innerHTML = `<i class="fas fa-book"></i> ${fetchedChapters.length} Bab`;
    doc.getElementById('novel-stats-words').innerHTML = `<i class="fas fa-keyboard"></i> ${calculatedTotalWords.toLocaleString('id-ID')} Kata`;
},
renderChapterEditor: (novelId, chapterId) => {
    const novel = methods.getSingleLocalNovel(Number(novelId));
    if (!novel) return methods.renderView('app-dashboard');
    
    state.activeNovelId = Number(novelId);
    const isNew = chapterId === 'new' || chapterId === null;
    state.activeChapterId = isNew ? null : Number(chapterId);
    
    let chapter = { chapterTitle: 'Bab Baru', text: '' };
    
    if (!isNew) {
        const foundChapter = novel.chapters.find(c => c.chapterId === state.activeChapterId);
        if (foundChapter) {
            chapter = foundChapter;
        } else {
            methods.showNotification("Bab tidak ditemukan!", "error");
            return methods.renderNovelDetail(state.activeNovelId);
        }
    }
    
    if (window.innerWidth <= 768) {
        el.editorGrid.classList.add('view-mode-original');
        el.editorGrid.classList.remove('view-mode-revisi');
        el.viewOriginalBtn.classList.add('active');
        el.viewRevisiBtn.classList.remove('active');
    } else {
        el.editorGrid.classList.remove('view-mode-original', 'view-mode-revisi');
    }
    
    document.title = `Editor: ${chapter.chapterTitle} - Noveler Pro`;
    el.mainHeaderTitle.value = chapter.chapterTitle;
    el.novelInput.value = chapter.text || '';
    el.revisionOutput.value = '';
    methods.updateStats(el.novelInput);
    state.isEditorDirty = false;
    methods.renderView('chapter-editor-view');
},
    updateDropboxUIState: () => {
        const authLinkContainer = doc.getElementById('dropbox-auth-link-container');
        const authModalButton = doc.getElementById('auth-dropbox-btn');
        if (state.dropboxAuthorized) {
            if (authLinkContainer) authLinkContainer.style.display = 'none';
            if (authModalButton) {
                authModalButton.disabled = true;
                authModalButton.innerHTML = `<i class="fas fa-check"></i> Terhubung ke Dropbox`;
            }
        } else {
            if (authLinkContainer) authLinkContainer.style.display = 'list-item';
            if (authModalButton) {
                authModalButton.disabled = false;
                authModalButton.innerHTML = `<i class="fab fa-dropbox"></i> Lanjut Otentikasi`;
            }
        }
    },
    updateSyncStatus: (status) => {
        let syncStatusEl = doc.getElementById('sync-status');
        if (!syncStatusEl) {
            syncStatusEl = doc.createElement('div');
            syncStatusEl.id = 'sync-status';
            doc.querySelector('.main-header-right').prepend(syncStatusEl);
        }
        let statusHTML = '';
        switch (status) {
            case 'syncing':
                statusHTML = `<i class="fas fa-sync fa-spin"></i> <span>Menyinkronkan...</span>`;
                break;
            case 'synced':
                statusHTML = `<i class="fas fa-check-circle"></i> <span>Tersinkronisasi</span>`;
                break;
            case 'error':
                statusHTML = `<i class="fas fa-exclamation-triangle"></i> <span>Gagal Sinkron</span>`;
                break;
            default:
                statusHTML = ``;
        }
        syncStatusEl.innerHTML = statusHTML;
    },
    updateRealmMode: () => {
    if (currentUser) {
        if (state.dropboxAuthorized) {
            doc.body.classList.remove('alam-lokal');
            doc.body.classList.add('alam-cloud');
        } else {
            doc.body.classList.remove('alam-lokal');
            doc.body.classList.remove('alam-cloud');
        }
    } else {
        doc.body.classList.remove('alam-cloud');
        doc.body.classList.add('alam-lokal');
    }
},
    initializeDropboxClient: (accessToken) => {
        if (!accessToken) {
            state.dropboxAuthorized = false;
            DROPBOX_CONFIG.dropboxClient = null;
            DROPBOX_CONFIG.accessToken = null;
        } else {
            DROPBOX_CONFIG.accessToken = accessToken;
            try {
                DROPBOX_CONFIG.dropboxClient = new Dropbox.Dropbox({
                    accessToken: DROPBOX_CONFIG.accessToken
                });
                state.dropboxAuthorized = true;
            } catch (error) {
                state.dropboxAuthorized = false;
            }
        }
        methods.updateDropboxUIState();
        methods.updateRealmMode();
        return state.dropboxAuthorized;
    },
    initDropbox() {
        const accessToken = localStorage.getItem(`dropbox_auth_${currentUser?.uid}`);
        return methods.initializeDropboxClient(accessToken);
    },
    forceRestoreFromCloud: async () => {
    const userConfirmed = await methods.showConfirmModal(
        "Konfirmasi Pemulihan Data",
        "Tindakan ini akan menghapus semua data di browser dan menggantinya dengan data terbaru dari Dropbox. Ini berguna jika data Anda terasa rusak atau tidak sinkron. Lanjutkan?"
    );
    
    if (!userConfirmed) return;
    
    if (!methods.checkDropboxAuth()) {
        methods.showNotification("Harap hubungkan Dropbox terlebih dahulu.", "error");
        return;
    }
    
    const progress = methods.showProgressPanel("Memulihkan Data...", "Memulai proses...");
    const dbx = DROPBOX_CONFIG.dropboxClient;
    
    try {
        progress.update("Menganalisis novel...");
        const novelFolders = await methods.listFilesInDropboxFolder('/Novel/');
        
        const restoredNovelsPromises = novelFolders
            .filter(entry => entry['.tag'] === 'folder')
            .map(async (folder) => {
                try {
                    progress.update(`Memproses ${folder.name}...`);
                    
                    const dataPath = `${folder.path_lower}/data.json`;
                    const fileContentResponse = await methods.callDropboxApi(
                        dbx.filesDownload.bind(dbx), { path: dataPath }
                    );
                    const fileText = await fileContentResponse.result.fileBlob.text();
                    let novelMetadata = JSON.parse(fileText);
                    
                    if (novelMetadata.coverPath) {
                        progress.update(`Memperbaiki cover ${folder.name}...`);
                        novelMetadata.coverImage = await methods.getOrCreatePermanentLink(novelMetadata.coverPath);
                    }
                    
                    return await methods.fetchFullNovelDataFromCloud(novelMetadata.id, novelMetadata);
                    
                } catch (e) {
                    return null;
                }
            });
        
        const completeCloudNovels = (await Promise.all(restoredNovelsPromises)).filter(Boolean);
        
        progress.update("Memulihkan foto profil...");
        const profilePhotoPath = `/Profile/PotoProfile/`;
        const allProfilePhotos = await methods.listFilesInDropboxFolder(profilePhotoPath);
        
        const userPhotos = allProfilePhotos
            .filter(file => file.name.startsWith(currentUser.uid))
            .sort((a, b) => {
                const timestampA = parseInt(a.name.split('-')[1] || 0);
                const timestampB = parseInt(b.name.split('-')[1] || 0);
                return timestampB - timestampA;
            });
        
        if (userPhotos.length > 0) {
            const latestPhotoPath = userPhotos[0].path_lower;
            const permanentUrl = await methods.getOrCreatePermanentLink(latestPhotoPath);
            
            await database.ref(`profiles/${currentUser.uid}`).update({
                photoURL: permanentUrl,
                photoPath: latestPhotoPath
            });
        }
        
        progress.update("Menggabungkan data");
        state.localData.novels = completeCloudNovels;
        methods.saveLocalData();
        
        progress.update("Pemulihan selesai!", "success");
        
        setTimeout(() => {
            progress.close();
            sessionStorage.removeItem('initialSyncDone');
            methods.renderView('app-dashboard');
        }, 2000);
        
    } catch (error) {
        progress.update(`Error: ${error.message}`, "error");
        setTimeout(() => progress.close(), 4000);
    }
},
handleCreateNovel: async () => {
    if (state.isSaving) return;
    const title = doc.getElementById('new-novel-title').value.trim();
    if (!title) return methods.showNotification('Judul wajib diisi!');
    
    state.isSaving = true;
    methods.showLoading("Membuat novel...");
    
    try {
        const newNovelId = Date.now();
        const novelData = {
            id: newNovelId, projectTitle: title,
            description: doc.getElementById('new-novel-desc').value.trim(),
            genres: Array.from(doc.querySelectorAll('#new-novel-genres input:checked')).map(cb => cb.value),
            lastUpdated: Date.now(), chapters: [],
            coverImage: null, coverPath: null,
            chapterCount: 0, totalWords: 0, wordCounts: {}
        };

        const coverFile = doc.getElementById('new-novel-cover').files[0];
        if (coverFile && methods.checkDropboxAuth()) {
            const coverPath = `/Novel/${newNovelId}/Cover/${Date.now()}_${coverFile.name}`;
            await methods.uploadFileToDropbox(coverPath, coverFile);
            const coverUrl = await methods.getOrCreatePermanentLink(coverPath);
            novelData.coverImage = coverUrl;
            novelData.coverPath = coverPath;
        }

        state.localData.novels.unshift(novelData);
        methods.saveLocalData();
        
        methods.hideModal(modals.createNovel);
        methods.addActivity('fas fa-plus-circle', `Membuat novel baru: "${title}"`);
        methods.resetCreateNovelForm();
        methods.renderView('app-dashboard');
        methods.showNotification('Novel berhasil dibuat!');

        methods.syncQueue.add(newNovelId);

    } catch (error) {
        methods.showNotification(`Gagal membuat novel: ${error.message}`, 6000);
    } finally {
        state.isSaving = false;
        methods.hideLoading();
    }
},

handleEditNovel: async () => {
    if (state.isSaving || !state.activeNovelId) return;

    state.isSaving = true;
    methods.showLoading("Memperbarui novel");

    try {
        const novelId = state.activeNovelId;
        const novelIndex = state.localData.novels.findIndex(n => n.id === novelId);
        if (novelIndex === -1) throw new Error("Novel tidak ditemukan.");
        
        const novelData = state.localData.novels[novelIndex];
        novelData.projectTitle = doc.getElementById('edit-novel-title').value.trim();
        novelData.description = doc.getElementById('edit-novel-desc').value.trim();
        novelData.genres = Array.from(doc.querySelectorAll('#edit-novel-genres input:checked')).map(cb => cb.value);
        novelData.lastUpdated = Date.now();

        const coverFile = doc.getElementById('edit-novel-cover').files[0];
        if (coverFile && methods.checkDropboxAuth()) {
            if (novelData.coverPath) await methods.deleteFileFromDropbox(novelData.coverPath);
            const newCoverPath = `/Novel/${novelId}/Cover/${Date.now()}_${coverFile.name}`;
            await methods.uploadFileToDropbox(newCoverPath, coverFile);
            const newCoverUrl = await methods.getOrCreatePermanentLink(newCoverPath);
            novelData.coverImage = newCoverUrl;
            novelData.coverPath = newCoverPath;
        }

        state.localData.novels[novelIndex] = novelData;
        methods.saveLocalData();
        
        methods.hideModal(modals.editNovel);
        methods.showNotification('Novel berhasil diperbarui!');
        methods.renderNovelDetail(novelId);

        methods.syncQueue.add(novelId);

    } catch (error) {
        methods.showNotification(`Gagal edit novel: ${error.message}`, 6000);
    } finally {
        state.isSaving = false;
        methods.hideLoading();
    }
},
handleDeleteChapter: async (novelId, chapterId) => {
    const nId = Number(novelId);
    const cId = Number(chapterId);
    
    const novel = methods.getSingleLocalNovel(nId);
    if (!novel) return;
    
    const chapterTitle = novel.chapters.find(c => c.chapterId === cId)?.chapterTitle || 'tanpa judul';
    
    novel.chapters = novel.chapters.filter(c => c.chapterId !== cId);
    novel.lastUpdated = Date.now();
    methods.saveLocalData();
    
    methods.showNotification("Bab dihapus dari aplikasi.");
    methods.renderNovelDetail(nId);
    methods.hideModal(modals.deleteConfirm);
    methods.addActivity('fas fa-trash', `Menghapus bab "${chapterTitle}"`);
    
    methods.showNotification("Memulai sinkronisasi pembersihan di cloud...");
    try {
        await methods.syncAndCleanNovelInCloud(nId);
        methods.showNotification("Sinkronisasi pembersihan selesai.", 3000);
    } catch (error) {
        methods.showNotification("Gagal membersihkan chapter di cloud.", "error");
    }
},
syncAndCleanNovelInCloud: async (novelId) => {
    if (!methods.checkDropboxAuth()) {
        return;
    }

    const novel = methods.getSingleLocalNovel(novelId);
    if (!novel) {
        return;
    }

    const dbx = DROPBOX_CONFIG.dropboxClient;
    const chapterFolderPath = `/Novel/${novelId}/Chapter`;

    const localChapterIds = new Set(novel.chapters.map(c => `${c.chapterId}.json`));

    let cloudChapterFiles = [];
    try {
        cloudChapterFiles = await methods.listFilesInDropboxFolder(chapterFolderPath);
    } catch (e) {
        // Folder not found is okay
    }

    const deletionPromises = [];
    for (const cloudFile of cloudChapterFiles) {
        if (!localChapterIds.has(cloudFile.name)) {
            deletionPromises.push(methods.deleteFileFromDropbox(cloudFile.path_lower));
        }
    }

    if (deletionPromises.length > 0) {
        await Promise.all(deletionPromises);
    }

    await methods.syncSingleNovelToCloud(novelId);
},
    getAiRevision: async function() {
        const textToRevise = el.novelInput.value.trim();
        if (!textToRevise) return methods.showNotification("Naskah kosong, tidak ada yang bisa direvisi.");
        methods.showLoading("Merevisi naskah...");
        const settings = {
            genre: doc.querySelector('input[name="revisi-genre"]:checked')?.value || 'umum',
            style: doc.querySelector('input[name="revisi-style"]:checked').value,
            focus: Array.from(doc.querySelectorAll('input[name="revisi-focus"]:checked')).map(cb => cb.value),
            pov: doc.querySelector('input[name="revisi-pov"]:checked').value,
            audience: doc.querySelector('input[name="revisi-audience"]:checked').value,
            tone: doc.getElementById('revisi-tone-input').value.trim(),
            customInstruction: doc.getElementById('revisi-custom-instruction').value.trim()
        };
        let prompt = `Anda adalah editor novel profesional. Revisi naskah berikut. Kembalikan HANYA teks novel yang sudah direvisi, tanpa tambahan penjelasan, judul, atau catatan apapun.`;
        prompt += `\nKonteks: genre "${settings.genre}", gaya revisi "${settings.style}", target pembaca "${settings.audience}".`;
        if (settings.focus.length > 0) prompt += `\nFokus perbaikan: ${settings.focus.join(', ')}.`;
        if (settings.tone) prompt += `\nTone: ${settings.tone}.`;
        if (settings.pov !== 'tidak mengubah') prompt += `\nSudut pandang: ${settings.pov}.`;
        if (settings.customInstruction) prompt += `\nInstruksi khusus: "${settings.customInstruction}".`;
        prompt += `\n\nNaskah Asli:\n"${textToRevise}"`;
        prompt += `\n\nOutput hanya revisi teks, tanpa catatan:`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error((await response.json()).error.message);
            const data = await response.json();
            const revisedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, '$1') || "Gagal merevisi.";
            doc.getElementById('preview-revisi-text').value = revisedText;
            methods.hideModal(modals.settings);
            methods.showModal(modals.revisiPreview);
            methods.showNotification("Revisi selesai, silakan tinjau!");
        } catch (error) {
            methods.showNotification("Error revisi: " + error.message, 'error');
        } finally {
            methods.hideLoading();
        }
    },
    getAiGeneratedStory: async function() {
    const prompt = doc.getElementById('generate-prompt-input').value.trim();
    if (!prompt) return methods.showNotification("Prompt cerita wajib diisi!");
    
    const location = doc.getElementById('generate-location-input').value.trim();
    const protagonist = doc.getElementById('generate-protagonist-name').value.trim();
    const otherChars = Array.from(doc.querySelectorAll('#generate-additional-characters input')).map(i => i.value.trim()).filter(Boolean);
    const genre = doc.querySelector('input[name="generate-genre"]:checked')?.value || 'Fantasi';
    const style = doc.querySelector('input[name="style"]:checked').value;
    const dialog = doc.querySelector('input[name="dialog"]:checked').value;
    const details = Array.from(doc.querySelectorAll('input[name="generate-detail"]:checked')).map(cb => cb.value);
    
    const lengthMap = {
        pendek: 'sekitar 150 kata',
        sedang: 'sekitar 500 kata',
        panjang: 'sekitar 1000 kata',
        'sangat-panjang': 'sekitar 2000 kata',
        'epik': 'sekitar 5000 kata'
    };
    const length = lengthMap[doc.querySelector('input[name="length"]:checked').value];
    
    let fullPrompt = `Buatlah sebuah cerita fiksi dalam Bahasa Indonesia. Kembalikan HANYA teks cerita yang sudah dibuat, tanpa judul, pengantar, atau catatan apapun.`;
    fullPrompt += `\n\nBerikut adalah detailnya:`;
    fullPrompt += `\n- Ide Utama: "${prompt}".`;
    if (location) fullPrompt += `\n- Lokasi/Setting: ${location}.`;
    fullPrompt += `\n- Genre: ${genre}.`;
    if (protagonist) fullPrompt += `\n- Karakter Utama: ${protagonist}.`;
    if (otherChars.length > 0) fullPrompt += `\n- Karakter Lain: ${otherChars.join(', ')}.`;
    fullPrompt += `\n- Gaya Penulisan: ${style}.`;
    if (details.length > 0) fullPrompt += `\n- Nuansa Cerita: ${details.join(', ')}.`;
    fullPrompt += `\n- Gaya Dialog: ${dialog}.`;
    fullPrompt += `\n- Panjang yang Diinginkan: ${length}.`;
    fullPrompt += `\n\nOutput hanya teks cerita, tanpa tambahan:`;
    
    methods.showLoading("Menyiapkan cerita...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
        });
        if (!response.ok) throw new Error((await response.json()).error.message);
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal membuat cerita.";
        doc.getElementById('generate-preview-text').value = generatedText;
        methods.hideModal(modals.generate);
        methods.showModal(modals.generatePreview);
        methods.showNotification("Cerita berhasil dibuat, silakan tinjau!");
    } catch (error) {
        methods.showNotification("Error generate: " + error.message, 'error');
    } finally {
        methods.hideLoading();
    }
},
    addCharacterInput: () => {
        const container = el.additionalCharactersContainer;
        const inputGroup = doc.createElement('div');
        inputGroup.className = 'character-input-group';
        inputGroup.innerHTML = `
            <input type="text" class="text-input" placeholder="Nama karakter lain..." />
            <button class="remove-character-btn" title="Hapus" aria-label="Hapus Karakter"><i class="fas fa-times"></i></button>
            `;
        container.appendChild(inputGroup);
        inputGroup.querySelector('.remove-character-btn').addEventListener('click', () => {
            container.removeChild(inputGroup);
        });
    },
    createAnimatedBackground: (animationType) => {
        const bg = el.animatedBg;
        doc.querySelectorAll('.animation-container').forEach(c => c.innerHTML = '');
        doc.querySelectorAll('.animation-container').forEach(c => c.style.display = 'none');
        bg.style.backgroundImage = '';
        bg.style.animation = '';
        switch (animationType) {
            case 'none': break;
            case 'bubbles':
                el.bubblesContainer.style.display = 'block';
                if (el.bubblesContainer.children.length === 0) {
                    for (let i = 0; i < 30; i++) {
                        const bubble = doc.createElement('span');
                        const size = Math.random() * 8 + 4 + 'px';
                        const animationDuration = Math.random() * 20 + 10 + 's';
                        const animationDelay = Math.random() * 8 + 's';
                        bubble.style.cssText = `width: ${size}; height: ${size}; left: ${Math.random() * 100}%; animation-duration: ${animationDuration}; animation-delay: ${animationDelay}; filter: blur(${Math.random() * 1}px);`;
                        el.bubblesContainer.appendChild(bubble);
                    }
                }
                break;
            case 'shooting-stars':
                el.shootingStarsContainer.style.display = 'block';
                if (el.shootingStarsContainer.children.length === 0) {
                    for (let i = 0; i < 15; i++) {
                        const star = doc.createElement('span');
                        const xStart = Math.random() * 100 + 'vw';
                        const yStart = Math.random() * -100 + 'vh';
                        const delay = Math.random() * 15 + 's';
                        star.style.cssText = `left: ${xStart}; top: ${yStart}; animation-delay: ${delay}; animation-duration: ${Math.random() * 8 + 5}s;`;
                        el.shootingStarsContainer.appendChild(star);
                    }
                }
                break;
            case 'blinking-stars':
                el.blinkingStarsContainer.style.display = 'block';
                if (el.blinkingStarsContainer.children.length === 0) {
                    for (let i = 0; i < 80; i++) {
                        const star = doc.createElement('span');
                        const x = Math.random() * 100 + 'vw';
                        const y = Math.random() * 100 + 'vh';
                        const delay = Math.random() * 7 + 's';
                        star.style.cssText = `left: ${x}; top: ${y}; animation-delay: ${delay};`;
                        el.blinkingStarsContainer.appendChild(star);
                    }
                }
                break;
            case 'fire-particles':
                el.fireParticlesContainer.style.display = 'block';
                if (el.fireParticlesContainer.children.length === 0) {
                    for (let i = 0; i < 40; i++) {
                        const particle = doc.createElement('span');
                        const size = Math.random() * 5 + 2 + 'px';
                        const animationDuration = Math.random() * 5 + 5 + 's';
                        const animationDelay = Math.random() * 5 + 's';
                        particle.style.cssText = `width: ${size}; height: ${size}; left: ${Math.random() * 100}vw; animation-duration: ${animationDuration}; animation-delay: ${animationDelay};`;
                        el.fireParticlesContainer.appendChild(particle);
                    }
                }
                break;
        }
    },
    initFirebase: () => {
        try {
            if (!firebase.apps.length) firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
            else firebaseApp = firebase.app();
            auth = firebase.auth();
            database = firebase.database();
            provider = new firebase.auth.GoogleAuthProvider();

            auth.onAuthStateChanged(async user => {
                currentUser = user;
                if (user) {
                    // --- Tampilkan menu dan jalankan fitur-fitur utama SEGERA ---
                    methods.updateAccountUI();
                    methods.updateExclusiveFeaturesUI();
                    methods.listenForCommunityMembers();
                    methods.syncProfile(user);
                    methods.setupPresence(user.uid);
                    if (!state.messageListenerAttached) methods.listenForChatData();

                    // --- Proses Dropbox di Latar Belakang ---
                    const pendingToken = sessionStorage.getItem('dropbox_token_pending');
                    if (pendingToken) {
                        sessionStorage.removeItem('dropbox_token_pending');
                        methods.showLoading("Menyimpan autentikasi Dropbox...");
                        try {
                            await database.ref(`profiles/${currentUser.uid}/dropboxToken`).set(pendingToken);
                            localStorage.setItem(`dropbox_auth_${currentUser.uid}`, pendingToken);
                            methods.initializeDropboxClient(pendingToken);
                        } catch (error) {
                            methods.showNotification("Gagal menyimpan token: " + error.message, 'error');
                        } finally {
                            methods.hideLoading();
                        }
                    } else {
                        const tokenRef = database.ref(`profiles/${user.uid}/dropboxToken`);
                        const snapshot = await tokenRef.once('value');
                        const token = snapshot.val();
                        if (token) {
                            localStorage.setItem(`dropbox_auth_${user.uid}`, token);
                            methods.initializeDropboxClient(token);
                        } else {
                            // Jika tidak ada token sama sekali, set state Dropbox ke tidak terhubung
                            methods.initializeDropboxClient(null);
                        }
                    }

                    // --- FINALISASI TAMPILAN ---
                    methods.updateRealmMode(); // Atur tema visual (alam cloud/lokal)
                    
                    // [INI PERBAIKANNYA]
                    // Panggil lagi fungsi updateAccountUI untuk memastikan menu utama
                    // (Profil, Komunitas, Cloud) TETAP TAMPIL berdasarkan status login Google,
                    // meskipun koneksi Dropbox gagal atau belum ada.
                    methods.updateAccountUI();

                } else {
                    // --- Logika untuk Logout (Tidak ada perubahan di sini) ---
                    methods.initializeDropboxClient(null);
                    methods.updateAccountUI();
                    methods.updateExclusiveFeaturesUI();
                    if (database) {
                        database.ref('messages').off();
                        database.ref('status').off();
                        database.ref('profiles').off();
                    }
                    if (el.onlineUsersList) el.onlineUsersList.innerHTML = '';
                    if (el.offlineUsersList) el.offlineUsersList.innerHTML = '';
                    state.messageListenerAttached = false;
                    methods.updateDropboxUIState();
                    methods.updateRealmMode();
                }
            });
        } catch (e) {
            console.error("Firebase Init Error:", e);
        }
    },
    handleDropboxIntegration: () => {
        if (!currentUser) return;
        const isAuthorized = methods.initDropbox();
        if (!isAuthorized) {
            methods.showDropboxAuthPrompt();
        }
        methods.updateDropboxUIState();
    },
    showDropboxAuthPrompt: () => {
        const sidebar = doc.getElementById('account-nav-list');
        if (!doc.getElementById('dropbox-auth-link-container')) {
            const authLinkContainer = doc.createElement('li');
            authLinkContainer.id = 'dropbox-auth-link-container';
            authLinkContainer.innerHTML = `
                <a class="nav-link" href="#" data-modal-target="dropbox-auth-modal">
                    <i class="fab fa-dropbox"></i>
                    <span>Autentikasi Dropbox</span>
                </a>
                `;
            sidebar.appendChild(authLinkContainer);
        }
        if (!modals['dropbox-auth-modal']) {
            const modalHtml = `
                <div class="modal" id="dropbox-auth-modal">
                    <div class="modal-panel" style="max-width: 450px;">
                        <div class="modal-header">
                            <h3 class="modal-title" style="display: flex; align-items: center; gap: 10px;">
                                <i class="fab fa-dropbox"></i>
                                <span>Autentikasi Dropbox</span>
                            </h3>
                            <button aria-label="Tutup" class="modal-close-btn">&amp;times;</button>
                        </div>
                        <div class="modal-body">
                            <p style="text-align: center; margin-top:0; margin-bottom: 1.5rem; color: var(--text-secondary);">
                                Amankan novel dan semua progres tulisanmu dengan menyimpannya ke cloud.
                            </p>
                            <p style="text-align: center; font-size: 0.9em; color: var(--text-secondary);">
                                Kami akan membuat folder khusus 'Noveler Pro' di akun Dropbox kamu untuk menyimpan semua data secara otomatis.
                            </p>
                        </div>
                        <div class="modal-footer" style="justify-content: center;">
                            <button class="app-button outline" data-action="close-modal">Lain Kali</button>
                            <button class="app-button primary" id="auth-dropbox-btn"><i class="fab fa-dropbox"></i> Lanjut Otentikasi</button>
                        </div>
                    </div>
                </div>
                `;
            doc.body.insertAdjacentHTML('beforeend', modalHtml);
            modals['dropbox-auth-modal'] = doc.getElementById('dropbox-auth-modal');
            doc.getElementById('auth-dropbox-btn').addEventListener('click', methods.authenticateWithDropbox);
        }
        methods.updateDropboxUIState();
    },
    authenticateWithDropbox: (forceRelink = false) => {
    if (forceRelink && currentUser) {
        localStorage.removeItem(`dropbox_auth_${currentUser.uid}`);
        if (database) {
            database.ref(`profiles/${currentUser.uid}/dropboxToken`).remove();
        }
        state.dropboxAuthorized = false;
        DROPBOX_CONFIG.dropboxClient = null;
        methods.showNotification("Silakan autentikasi ulang Dropbox Anda.");
    }
    try {
        const dbxAuth = new Dropbox.DropboxAuth({ clientId: DROPBOX_CONFIG.appKey });
        const redirectUrl = DROPBOX_CONFIG.redirectUri;
        
        dbxAuth.getAuthenticationUrl(redirectUrl, undefined, 'token')
            .then(authUrl => {
                if (isAndroidApp() && window.Android.openAuthUrl) {
                    const computedStyle = getComputedStyle(document.documentElement);
                    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim();
                    const textColor = computedStyle.getPropertyValue('--text-primary').trim();
                    window.Android.openAuthUrl(authUrl, bgColor, textColor);
                } else {
                    window.location.href = authUrl;
                }
            })
            .catch(error => {
                methods.showNotification('Gagal memulai autentikasi Dropbox.', 'error');
            });
    } catch (e) {
        methods.showNotification('Gagal memuat SDK Dropbox.', 'error');
    }
},
    handleDropboxRedirect: () => {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
            sessionStorage.setItem('dropbox_token_pending', accessToken);
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } else if (params.get('error')) {
            methods.showNotification("Autentikasi Dropbox dibatalkan atau gagal.", "error");
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
    },
syncProfile: (user) => {
    const userProfileRef = database.ref('profiles/' + user.uid);
    
    userProfileRef.on('value', snapshot => {
        const dbProfile = snapshot.val() || {};
        
        if (dbProfile.photoURL) {
            methods.updateAllProfileImages(user.uid, dbProfile.photoURL);
        }
        
        const newProfile = {
            name: dbProfile.displayName || user.displayName,
            photo: dbProfile.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`,
            desc: dbProfile.description || '',
            socials: dbProfile.socials || {},
            dob: dbProfile.dob || ''
        };

        localStorage.setItem(`${LOCAL_STORAGE_KEY_PROFILE}_${user.uid}`, JSON.stringify(newProfile));
        
        if (!snapshot.exists() || !dbProfile.displayName) {
            userProfileRef.update({
                displayName: newProfile.name,
                photoURL: newProfile.photo,
                description: newProfile.desc,
                socials: newProfile.socials,
                dob: newProfile.dob
            });
        }
        
        methods.updateAccountUI();
    });
},

    // INI ADALAH FUNGSI YANG DIPERBAIKI
    updateAccountUI() {
        // Ambil elemen-elemen penting langsung di sini agar lebih pasti
        const loginLink = document.getElementById('login-link-container');
        const profileLink = document.getElementById('user-profile-link-container');
        const communityLink = document.getElementById('community-link-container');
        // Targetkan <li> dari elemen 'backup-restore-link'
        const cloudLink = document.getElementById('backup-restore-link')?.parentElement;

        if (currentUser) {
            // Jika user LOGIN
            const profile = methods.getLocalProfile(currentUser.uid) || {};
            const photo = profile.photo || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'U')}`;
            const name = profile.name || currentUser.displayName;

            // Sembunyikan tombol login
            if (loginLink) loginLink.style.display = 'none';

            // Tampilkan tombol Profil, Komunitas, dan Cloud
            if (profileLink) {
                profileLink.style.display = 'list-item';
                // Update foto dan nama di sidebar
                profileLink.querySelector('.nav-link').innerHTML = `<img class="profile-nav-link-img" src="${photo}" alt="Profil"/><span>${name}</span>`;
            }
            if (communityLink) communityLink.style.display = 'list-item';
            if (cloudLink) cloudLink.style.display = 'list-item';

            // Tampilkan UI chat di halaman komunitas
            if (el.communityLoginStatus) el.communityLoginStatus.style.display = 'none';
            if (el.communityChatBox) el.communityChatBox.style.display = 'flex';
            if (el.communityChatInputWrapper) el.communityChatInputWrapper.style.display = 'flex';

        } else {
            // Jika user LOGOUT
            // Tampilkan tombol login
            if (loginLink) loginLink.style.display = 'list-item';

            // Sembunyikan tombol Profil, Komunitas, dan Cloud
            if (profileLink) profileLink.style.display = 'none';
            if (communityLink) communityLink.style.display = 'none';
            if (cloudLink) cloudLink.style.display = 'none';

            // Sembunyikan UI chat di halaman komunitas
            if (el.communityLoginStatus) el.communityLoginStatus.style.display = 'flex';
            if (el.communityChatBox) el.communityChatBox.style.display = 'none';
            if (el.communityChatInputWrapper) el.communityChatInputWrapper.style.display = 'none';
        }
    },

    updateExclusiveFeaturesUI: () => {
        if (currentUser) {
            el.exclusiveThemesContainer.style.display = 'block';
            el.loginForThemesPrompt.style.display = 'none';
        } else {
            el.exclusiveThemesContainer.style.display = 'none';
            el.loginForThemesPrompt.style.display = 'block';
        }
    },
    handleLogin() {
    if (isAndroidApp()) {
        Android.startGoogleLogin();
    } else {
        methods.handleWebLogin();
    }
},
    handleWebLogin() {
        auth.signInWithPopup(provider)
            .then((result) => {
                methods.showNotification("Login berhasil!");
                methods.hideModal(modals.requireApp);
            })
            .catch((error) => {
                console.error("Login gagal di browser:", error);
                methods.showNotification("Login gagal: " + error.message, 'error');
            });
    },
    autoSyncFromCloud: async () => {
    if (!methods.checkDropboxAuth()) {
        return;
    }
    
    try {
        const dbx = DROPBOX_CONFIG.dropboxClient;
        const novelFolders = await methods.listFilesInDropboxFolder('/Novel/');
        
        const novelPromises = novelFolders
            .filter(entry => entry['.tag'] === 'folder')
            .map(async (folder) => {
                try {
                    const dataPath = `${folder.path_lower}/data.json`;
                    const fileContentResponse = await methods.callDropboxApi(
                        dbx.filesDownload.bind(dbx), { path: dataPath }
                    );
                    const fileText = await fileContentResponse.result.fileBlob.text();
                    const novelMetadata = JSON.parse(fileText);
                    
                    const localNovel = methods.getSingleLocalNovel(novelMetadata.id);
                    
                    if (localNovel && localNovel.lastUpdated > novelMetadata.lastUpdated) {
                        return localNovel;
                    }
                    
                    return await methods.fetchFullNovelDataFromCloud(novelMetadata.id, novelMetadata);
                    
                } catch (e) {
                    return null;
                }
            });
        
        const cloudNovels = (await Promise.all(novelPromises)).filter(Boolean);
        
        const localOnlyNovels = state.localData.novels.filter(localNovel =>
            !cloudNovels.some(cloudNovel => cloudNovel.id === localNovel.id)
        );
        
        state.localData.novels = [...cloudNovels, ...localOnlyNovels];
        methods.saveLocalData();
        methods.renderDashboard(); 
        methods.showNotification("Data telah disinkronkan dari cloud.", 2000);
        
    } catch (error) {
        methods.showNotification("Gagal sinkronisasi otomatis dari cloud.", "error");
    }
},
    handleLogout() {
        auth.signOut().then(() => {
            currentUser = null;
            methods.updateAccountUI();
            methods.showNotification("Berhasil keluar.");
            methods.renderView('app-dashboard');
            methods.listenForCommunityMembers();
        }).catch(error => {
            methods.showNotification("Gagal keluar: " + error.message, 'error');
        });
    },
    listenForCommunityMembers() {
        if (!database) return;
        const profilesRef = database.ref('profiles');
        const statusRef = database.ref('status');
        profilesRef.on('value', profilesSnapshot => {
            profiles = profilesSnapshot.val() || {};
            methods.renderCommunityMembersList();
        });
        statusRef.on('value', statusSnapshot => {
            onlineStatus = statusSnapshot.val() || {};
            methods.renderCommunityMembersList();
        });
    },
    renderCommunityMembersList() {
        const container = doc.getElementById('community-members-list-container');
        if (!container) return;
        container.innerHTML = `
            <div class="community-member-section">
                <h4 class="section-title">Online (<span id="online-count">0</span>)</h4>
                <div id="online-users"></div>
            </div>
            <div class="community-member-section" style="margin-top: 20px;">
                <h4 class="section-title">Offline (<span id="offline-count">0</span>)</h4>
                <div id="offline-users"></div>
            </div>
            `;
        const onlineUsersEl = doc.getElementById('online-users');
        const offlineUsersEl = doc.getElementById('offline-users');
        const onlineCountEl = doc.getElementById('online-count');
        const offlineCountEl = doc.getElementById('offline-count');
        let onlineCount = 0;
        let offlineCount = 0;
        const sortedUids = Object.keys(profiles).sort((a, b) => {
            const nameA = profiles[a]?.displayName?.toLowerCase() || '';
            const nameB = profiles[b]?.displayName?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
        });
        sortedUids.forEach(uid => {
            const userProfile = profiles[uid];
            if (!userProfile) return;
            const isOnline = onlineStatus[uid]?.isOnline;
            const finalPhoto = userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.displayName || 'U')}&background=random`;
            const memberHtml = `
                <div class="community-member-item" data-uid="${uid}" data-action="view-profile">
                    <img src="${finalPhoto}" alt="Avatar" class="member-avatar" />
                    <span class="member-name">${userProfile.displayName || 'Pengguna'}</span>
                    <div class="status-indicator ${isOnline ? 'online' : 'offline'}"></div>
                </div>
                `;
            if (isOnline) {
                onlineUsersEl.innerHTML += memberHtml;
                onlineCount++;
            } else {
                offlineUsersEl.innerHTML += memberHtml;
                offlineCount++;
            }
        });
        onlineCountEl.textContent = onlineCount;
        offlineCountEl.textContent = offlineCount;
        if (onlineCount === 0) onlineUsersEl.innerHTML = '<p class="text-secondary" style="font-style: italic;">Tidak ada anggota online.</p>';
        if (offlineCount === 0) offlineUsersEl.innerHTML = '<p class="text-secondary" style="font-style: italic;">Tidak ada anggota offline.</p>';
    },
    setupPresence(uid) {
        const userStatusDatabaseRef = database.ref('/status/' + uid);
        const isOfflineForDatabase = {
            isOnline: false,
            last_changed: firebase.database.ServerValue.TIMESTAMP
        };
        const isOnlineForDatabase = {
            isOnline: true,
            last_changed: firebase.database.ServerValue.TIMESTAMP
        };
        database.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === false) return;
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    },
    listenForChatData() {
        if (!database || state.messageListenerAttached) return;
        const messagesRef = database.ref('messages').limitToLast(100);
        let initialLoad = true;
        el.communityChatBox.innerHTML = `
            <div class="loading-indicator-chat">
                <div class="spinner-chat"></div>
                <p class="loading-text">Memuat pesan...</p>
            </div>
            `;
        messagesRef.on('value', snapshot => {
            state.chatMessages = [];
            snapshot.forEach(child => {
                state.chatMessages.push({
                    key: child.key,
                    ...child.val()
                });
            });
            const loadingIndicator = el.communityChatBox.querySelector('.loading-indicator-chat');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            methods.renderCommunityMessages();
            if (initialLoad) {
                el.communityChatBox.scrollTop = el.communityChatBox.scrollHeight;
                initialLoad = false;
            }
        });
        state.messageListenerAttached = true;
    },
    renderCommunityMessages() {
        el.communityChatBox.innerHTML = '';
        let lastMessageDateStr = null;
        state.chatMessages.forEach(msg => {
            const msgDate = new Date(msg.timestamp);
            const msgDateStr = msgDate.toDateString();
            if (msgDateStr !== lastMessageDateStr) {
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.innerHTML = `<span>${methods.formatDateSeparator(msgDate)}</span>`;
                el.communityChatBox.appendChild(dateSeparator);
                lastMessageDateStr = msgDateStr;
            }
            methods.appendChatMessage(msg);
        });
        el.communityChatBox.scrollTop = el.communityChatBox.scrollHeight;
    },
    formatDateSeparator(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'HARI INI';
        if (date.toDateString() === yesterday.toDateString()) return 'KEMARIN';
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();
    },
    appendChatMessage: (msg) => {
        const messageWrapper = doc.createElement('div');
        messageWrapper.className = `chat-message ${currentUser && msg.uid === currentUser.uid ? 'out' : 'in'}`;
        const profile = profiles[msg.uid] || {};
        const displayName = profile.displayName || msg.author;
        const finalPhoto = profile.photoURL || msg.photoURL || 'https://placehold.co/40x40/2d3748/94a3b8?text=U';
        const avatar = `<img class="chat-avatar" data-action="view-profile" data-uid="${msg.uid}" src="${finalPhoto}" alt="Avatar"/>`;
        const authorHTML = currentUser && msg.uid !== currentUser.uid ? `<div class="chat-author" data-action="view-profile" data-uid="${msg.uid}">${displayName}</div>` : '';
        const content = `<div class="chat-content">
        ${authorHTML}
        <div class="chat-bubble ${currentUser && msg.uid === currentUser.uid ? 'out' : 'in'}" data-key="${msg.key}" data-uid="${msg.uid}">
            <span>${msg.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
        </div>
        <div class="chat-meta">${new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
    </div>`;
        messageWrapper.innerHTML = (currentUser && msg.uid === currentUser.uid) ? `${content}${avatar}` : `${avatar}${content}`;
        el.communityChatBox.appendChild(messageWrapper);
const chatBubble = messageWrapper.querySelector('.chat-bubble');

if (currentUser && msg.uid === currentUser.uid) {
    
    chatBubble.addEventListener('mousedown', methods.startLongPress);
    chatBubble.addEventListener('touchstart', methods.startLongPress);
    
    chatBubble.addEventListener('mouseup', methods.cancelLongPress);
    chatBubble.addEventListener('mouseleave', methods.cancelLongPress);
    chatBubble.addEventListener('touchend', methods.cancelLongPress);
    chatBubble.addEventListener('touchcancel', methods.cancelLongPress);
}
    },
startLongPress: (e) => {
    const chatBubble = e.currentTarget;
    
    if (!chatBubble) {
        return;
    }
    
    state.longPressTimer = setTimeout(() => {
        const msgKey = chatBubble.dataset.key;
        if (!msgKey) {
            return;
        }
        
        state.itemToDelete = {
            type: 'chat-message',
            id: msgKey,
            parentId: null
        };
        doc.getElementById('item-to-delete-name').innerHTML = `pesan ini`;
        methods.showModal(modals.deleteConfirm);
    }, 700);
},
    cancelLongPress: () => {
        clearTimeout(state.longPressTimer);
    },
    sendChatMessage() {
        const message = el.chatInput.value.trim();
        if (!message || !currentUser || !database) return;
        const profile = methods.getLocalProfile(currentUser.uid);
        database.ref('messages').push({
            text: message,
            author: profile.name || currentUser.displayName,
            uid: currentUser.uid,
            photoURL: profile.photo || currentUser.photoURL,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        el.chatInput.value = '';
        methods.addActivity('fas fa-comment', `Mengirim pesan di komunitas`);
    },
    initCommunityView() {
        if (!currentUser) {
            methods.renderView('app-dashboard');
            return;
        }
    },
    showProfile: async (uid) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) return methods.renderView('app-dashboard');

    methods.showLoading("Memuat profil...");
    try {
        const snapshot = await database.ref('profiles/' + targetUid).once('value');
        const dbProfile = snapshot.val() || {};

        const finalPhoto = dbProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(dbProfile.displayName || 'U')}&background=random`;
        doc.getElementById('profile-img').src = finalPhoto;
        
        doc.getElementById('profile-desc').textContent = dbProfile.description || 'Belum ada deskripsi.';
        const profileNameEl = doc.getElementById('profile-name');
        const isDropboxVerified = !!dbProfile.dropboxToken;
        if (isDropboxVerified) {
            profileNameEl.innerHTML = `${dbProfile.displayName || 'Pengguna'} <span class="verified-badge-check" title="Akun ini tersinkronisasi dengan Dropbox">✓</span>`;
        } else {
            profileNameEl.textContent = dbProfile.displayName || 'Pengguna';
        }
        
        const isOwnProfile = (currentUser && targetUid === currentUser.uid);
        const emailEl = doc.getElementById('profile-email');
        if (isOwnProfile && currentUser && currentUser.email) {
            emailEl.textContent = currentUser.email;
            emailEl.style.display = 'block';
        } else {
            emailEl.style.display = 'none';
        }
        doc.getElementById('edit-profile-btn').style.display = isOwnProfile ? 'inline-flex' : 'none';
        doc.getElementById('logout-btn-profile').style.display = isOwnProfile ? 'inline-flex' : 'none';
        methods.renderSocialLinks(dbProfile.socials, doc.getElementById('social-links-view'));

    } catch (error) {
        methods.showNotification("Gagal memuat profil.", "error");
    } finally {
        methods.hideLoading();
    }
},
showProfileModal: async (uid) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) return;

    try {
        const snapshot = await database.ref('profiles/' + targetUid).once('value');
        const profile = snapshot.val() || { displayName: 'Pengguna', description: 'Belum ada deskripsi.', socials: {} };
        
        const isOwnProfile = (currentUser && targetUid === currentUser.uid);
        const displayName = profile.displayName || 'Pengguna';
        const finalPhoto = profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
        const isDropboxVerified = !!profile.dropboxToken;

        modals.profile.querySelector('#profile-img-modal').src = finalPhoto;
        const modalNameEl = modals.profile.querySelector('#profile-name-modal');
        if (isDropboxVerified) {
            modalNameEl.innerHTML = `${displayName} <span class="verified-badge-check" title="Akun ini tersinkronisasi dengan Dropbox">✓</span>`;
        } else {
            modalNameEl.textContent = displayName;
        }
        modals.profile.querySelector('#profile-desc-modal').textContent = profile.description || 'Belum ada deskripsi.';
        
        const emailEl = modals.profile.querySelector('#profile-email-modal');
        if (isOwnProfile && currentUser && currentUser.email) {
            emailEl.textContent = currentUser.email;
            emailEl.style.display = 'block';
        } else {
            emailEl.style.display = 'none';
        }

        const footer = modals.profile.querySelector('#profile-footer-actions');
        footer.innerHTML = '';
        if (isOwnProfile) {
            const editBtn = doc.createElement('button');
            editBtn.className = 'app-button outline';
            editBtn.textContent = 'Edit Profil';
            editBtn.dataset.modalTarget = 'edit-profile-modal';
            footer.appendChild(editBtn);
        }
        methods.renderSocialLinks(profile.socials, modals.profile.querySelector('#social-links-view-modal'));
        methods.showModal(modals.profile);
    } catch (e) {
        methods.showNotification("Gagal memuat profil.", "error");
    }
},
    showEditProfile: async () => {
        if (!currentUser) return;
        const finalProfile = methods.getFinalProfile(currentUser.uid);
        modals['edit-profile-modal'].querySelector('#profile-edit-img').src = finalProfile.photo;
        modals['edit-profile-modal'].querySelector('#profile-edit-name').value = finalProfile.name;
        modals['edit-profile-modal'].querySelector('#profile-edit-dob').value = finalProfile.dob;
        modals['edit-profile-modal'].querySelector('#profile-edit-desc').value = finalProfile.desc;
        ['tiktok', 'instagram', 'youtube', 'facebook'].forEach(social => {
            modals['edit-profile-modal'].querySelector(`#social-${social}`).value = finalProfile.socials?.[social] || '';
        });
        methods.showModal(modals['edit-profile-modal']);
    },
    saveProfile: async () => {
    if (state.isSaving || !currentUser) return;
    const saveBtn = doc.getElementById('save-profile-btn');
    state.isSaving = true;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Menyimpan...';
    methods.showLoading("Menyimpan profil...");
    try {
        const profileRef = database.ref('profiles/' + currentUser.uid);
        const snapshot = await profileRef.once('value');
        const oldProfileData = snapshot.val() || {};
        const profileDataToSave = {
            displayName: modals['edit-profile-modal'].querySelector('#profile-edit-name').value,
            description: modals['edit-profile-modal'].querySelector('#profile-edit-desc').value,
            dob: modals['edit-profile-modal'].querySelector('#profile-edit-dob').value,
            socials: {
                tiktok: modals['edit-profile-modal'].querySelector('#social-tiktok').value,
                instagram: modals['edit-profile-modal'].querySelector('#social-instagram').value,
                youtube: modals['edit-profile-modal'].querySelector('#social-youtube').value,
                facebook: modals['edit-profile-modal'].querySelector('#social-facebook').value
            },
            photoURL: oldProfileData.photoURL || null,
            photoPath: oldProfileData.photoPath || null,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        };
        const photoFile = modals['edit-profile-modal'].querySelector('#profile-edit-photo').files[0];
        if (photoFile) {
            if (!methods.checkDropboxAuth()) {
                throw new Error("Dropbox belum terhubung untuk upload foto.");
            }
            methods.showLoading("Upload Poto...");
            if (oldProfileData.photoPath) {
                await methods.deleteFileFromDropbox(oldProfileData.photoPath);
            }
            const uniqueFileName = `${currentUser.uid}-${Date.now()}_${photoFile.name}`;
            const newPhotoPath = `/Profile/PotoProfile/${uniqueFileName}`;
            await methods.uploadFileToDropbox(newPhotoPath, photoFile);
            
            const newPermanentUrl = await methods.getOrCreatePermanentLink(newPhotoPath);
            if (newPermanentUrl) {
                profileDataToSave.photoURL = newPermanentUrl;
                profileDataToSave.photoPath = newPhotoPath;
            } else {
                throw new Error("Gagal membuat link permanen untuk foto.");
            }
        }
        await profileRef.update(profileDataToSave);
        methods.showNotification("Profil berhasil diperbarui!", 3000);
        methods.hideModal(modals['edit-profile-modal']);
    } catch (error) {
        methods.showNotification(`Gagal menyimpan: ${error.message}`, 6000);
    } finally {
        state.isSaving = false;
        saveBtn.disabled = false;
        saveBtn.textContent = "Simpan Profil";
        methods.hideLoading();
    }
},
    getFinalProfile: (uid) => {
        const dbProfile = profiles[uid];
        const authUser = (uid === currentUser?.uid) ? currentUser : null;
        const defaultName = authUser ? authUser.displayName : 'Pengguna';
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=random`;
        
        let finalProfile = {
            name: defaultName,
            photo: fallbackAvatar,
            dob: '',
            desc: 'Belum ada deskripsi.',
            socials: {}
        };

        if (dbProfile) {
            finalProfile.name = dbProfile.displayName || finalProfile.name;
            finalProfile.photo = dbProfile.photoURL || finalProfile.photo;
            finalProfile.dob = dbProfile.dob || finalProfile.dob;
            finalProfile.desc = dbProfile.description || finalProfile.desc;
            finalProfile.socials = dbProfile.socials || finalProfile.socials;
        } else if (authUser) {
            finalProfile.photo = authUser.photoURL || finalProfile.photo;
        }
        
        return finalProfile;
    },
    updateAllProfileImages: (uid, newPhotoUrl) => {
        if (!uid || !newPhotoUrl) return;
        if (currentUser && currentUser.uid === uid) {
            const sidebarImg = document.querySelector('.profile-nav-link-img');
            if (sidebarImg) sidebarImg.src = newPhotoUrl;
        }
        const mainProfileImg = document.getElementById('profile-img');
        if (mainProfileImg && document.getElementById('user-profile-view').classList.contains('active')) {
            mainProfileImg.src = newPhotoUrl;
        }
        const modalProfileImg = document.getElementById('profile-img-modal');
        if (modalProfileImg && document.getElementById('profile-modal').classList.contains('is-open')) {
            modalProfileImg.src = newPhotoUrl;
        }
        const communityMemberImgs = document.querySelectorAll(`.community-member-item[data-uid="${uid}"] .member-avatar`);
        communityMemberImgs.forEach(img => img.src = newPhotoUrl);
        const chatAvatars = document.querySelectorAll(`.chat-avatar[data-uid="${uid}"]`);
        chatAvatars.forEach(img => img.src = newPhotoUrl);
    },
    getLocalProfile: (uid) => {
        try {
            return JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_PROFILE}_${uid}`)) || {};
        } catch (e) {
            return {};
        }
    },
    renderSocialLinks(socials, container) {
        container.innerHTML = '';
        if (!socials) return;
        const socialIcons = {
            tiktok: 'fab fa-tiktok',
            instagram: 'fab fa-instagram',
            youtube: 'fab fa-youtube',
            facebook: 'fab fa-facebook'
        };
        const socialUrls = {
            tiktok: (u) => `https://www.tiktok.com/@${u}`,
            instagram: (u) => `https://www.instagram.com/${u}`,
            youtube: (u) => `https://www.youtube.com/channel/${u}`,
            facebook: (u) => `https://www.facebook.com/${u}`
        };
        for (const [key, user] of Object.entries(socials)) {
            if (user && socialUrls[key]) {
                const a = doc.createElement('a');
                a.href = socialUrls[key](user.replace(/^(https?:\/\/)?(www\.)?(tiktok|instagram|youtube|facebook)\.com\/(channel\/)?(@)?/i, ''));
                a.target = '_blank';
                a.title = key.charAt(0).toUpperCase() + key.slice(1);
                a.innerHTML = `<i class='${socialIcons[key]}'></i>`;
                container.appendChild(a);
            }
        }
    },
    createAllModals: () => {
        modals = {
            createNovel: doc.getElementById('create-novel-modal'),
            editNovel: doc.getElementById('edit-novel-modal'),
            backupRestore: doc.getElementById('backup-restore-modal'),
            generate: doc.getElementById('generate-modal'),
            settings: doc.getElementById('revisi-setting-modal'),
            revisiPreview: doc.getElementById('revisi-preview-modal'),
            generatePreview: doc.getElementById('generate-preview-modal'),
            deleteConfirm: doc.getElementById('delete-confirm-modal'),
            displaySettings: doc.getElementById('display-settings-modal'),
            profile: doc.getElementById('profile-modal'),
            'edit-profile-modal': doc.getElementById('edit-profile-modal'),
            'community-members-modal': doc.getElementById('community-members-modal'),
            quickRevise: doc.getElementById('quick-revisi-modal'),
            requireApp: doc.getElementById('require-app-modal'),
            downloadApp: doc.getElementById('download-app-modal') 
        };
    },
    loadInitialState: () => {
        const savedTheme = localStorage.getItem('userTheme') || 'dark';
        const savedFont = localStorage.getItem('userFont') || 'poppins';
        const savedAnimation = localStorage.getItem('userAnimation') || 'subtle-gradient';
        const savedSystemFontSize = parseFloat(localStorage.getItem('system-font-size-slider')) || 1;
        root.style.setProperty('--font-size-base', savedSystemFontSize + 'rem');
        const genreHTML = config.novelGenres.map(g => `<label><input type="checkbox" name="genre" value="${g}"/><span>${g}</span></label>`).join('');
        doc.getElementById('new-novel-genres').innerHTML = genreHTML;
        doc.getElementById('edit-novel-genres').innerHTML = genreHTML;
        const revisiGenreHTML = config.novelGenres.map((g, i) => `<label><input type="radio" name="revisi-genre" value="${g}" ${i === 0 ? 'checked' : ''}/><span>${g}</span></label>`).join('');
        doc.getElementById('revisi-genre-options').innerHTML = revisiGenreHTML;
        const generateGenreHTML = config.novelGenres.map((g, i) => `<label><input type="radio" name="generate-genre" value="${g}" ${i === 0 ? 'checked' : ''}/><span>${g}</span></label>`).join('');
        doc.getElementById('generate-genre-options').innerHTML = generateGenreHTML;
        const fontContainer = doc.getElementById('font-options');
        fontContainer.innerHTML = config.fontList.map(font => `<label><input type="radio" name="font" value="${font.toLowerCase().replace(/\s/g, '-')}"/><span>${font}</span></label>`).join('');
        methods.loadDisplaySettings();
        methods.applyDisplaySettings(savedTheme, savedFont, savedAnimation);
    },
    handleExternalLink: (url) => {
    if (isAndroidApp() && window.Android.openAuthUrl) {
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('--bg-primary').trim();
        const textColor = computedStyle.getPropertyValue('--text-primary').trim();
        window.Android.openAuthUrl(url, bgColor, textColor);
    } else {
        window.open(url, '_blank'); 
    }
},
    loadDisplaySettings: () => {
        const fontSizeSlider = doc.getElementById('system-font-size-slider');
        const savedFontSize = localStorage.getItem('system-font-size-slider') || 1;
        root.style.setProperty('--font-size-base', savedFontSize + 'rem');
        fontSizeSlider.value = savedFontSize;
        fontSizeSlider.nextElementSibling.textContent = `${savedFontSize}rem`;
    },
    getFontFallback: (fontName) => {
        const monoKeywords = ['Mono', 'Code', 'Typewriter', 'Inconsolata', 'VT323'];
        const serifKeywords = ['Serif', 'Garamond', 'Playfair', 'Slab', 'Crimson', 'Cardo', 'Domine', 'Vollkorn', 'Bitter', 'Taviraj', 'Kreon', 'BioRhyme', 'Cinzel', 'Fauna', 'Quattrocento', 'Sanchez', 'Alegreya', 'Lora', 'Merriweather'];
        const cursiveKeywords = ['Cursive', 'Pacifico', 'Caveat', 'Rakkas', 'Lobster', 'Fredoka', 'Patua', 'Righteous', 'Megrim', 'Monoton'];
        if (monoKeywords.some(keyword => fontName.includes(keyword))) { return 'monospace'; }
        if (cursiveKeywords.some(keyword => fontName.includes(keyword))) { return 'cursive'; }
        if (serifKeywords.some(keyword => fontName.includes(keyword))) { return 'serif'; }
        return 'sans-serif';
    },
    loadGoogleFont: (fontFamily) => {
        const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
        if (document.getElementById(fontId)) { return; }
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;700&display=swap`;
        document.head.appendChild(link);
    },
updateNativeTheme: () => {
    if (isAndroidApp()) {
        setTimeout(() => {
            const computedStyle = getComputedStyle(document.documentElement);
            const themeName = doc.body.dataset.theme;
            
            const themeData = {
                themeName: themeName,
                bgColor: computedStyle.getPropertyValue('--bg-primary').trim(),
                bgSecondaryColor: computedStyle.getPropertyValue('--bg-secondary').trim(),
                textColor: computedStyle.getPropertyValue('--text-primary').trim(),
                textSecondaryColor: computedStyle.getPropertyValue('--text-secondary').trim(),
                accentColor: computedStyle.getPropertyValue('--accent-color').trim(),
                dangerColor: computedStyle.getPropertyValue('--danger-color').trim(),
                borderColor: computedStyle.getPropertyValue('--border-color').trim(),
                bgColorRgb: computedStyle.getPropertyValue('--bg-primary-rgb').trim(),
                bgSecondaryRgb: computedStyle.getPropertyValue('--bg-secondary-rgb').trim(),
                accentColorRgb: computedStyle.getPropertyValue('--accent-color-rgb').trim(),
                fontMain: computedStyle.getPropertyValue('--font-main').trim(),
                fontMono: computedStyle.getPropertyValue('--font-mono').trim(),
                fontSizeBase: computedStyle.getPropertyValue('--font-size-base').trim(),
                fontSizeEditor: computedStyle.getPropertyValue('--font-size-editor').trim(),
                globalOpacity: computedStyle.getPropertyValue('--global-opacity').trim()
            };
            
            if (window.Android && typeof window.Android.setThemeRealtime === 'function') {
                window.Android.setThemeRealtime(JSON.stringify(themeData));
            }
        }, 100);
    }
},
    applyDisplaySettings: (theme, font, animation) => {
        doc.body.dataset.theme = theme;
        doc.body.dataset.font = font;
        localStorage.setItem('userTheme', theme);
        localStorage.setItem('userFont', font);
        localStorage.setItem('userAnimation', animation);
        
        if (el.animatedBg && typeof methods.createAnimatedBackground === 'function') {
            el.animatedBg.dataset.animation = animation;
            methods.createAnimatedBackground(animation);
        }
        
        const fontName = config.fontList.find(f => f.toLowerCase().replace(/\s/g, '-') === font);
        if (fontName && typeof methods.loadGoogleFont === 'function') {
            methods.loadGoogleFont(fontName);
            const fallback = methods.getFontFallback(fontName);
            root.style.setProperty('--font-main', `'${fontName}', ${fallback}`);
        }
        
        doc.querySelector(`input[name="theme"][value="${theme}"]`)?.setAttribute('checked', 'checked');
        doc.querySelector(`input[name="font"][value="${font}"]`)?.setAttribute('checked', 'checked');
        doc.querySelector(`input[name="animation"][value="${animation}"]`)?.setAttribute('checked', 'checked');
        
        methods.updateNativeTheme();
    },
    quickRevise: async () => {
        methods.showModal(modals.quickRevise);
    },
    confirmQuickRevise: async () => {
        const textToRevise = el.novelInput.value.trim();
        const quickReviseOption = doc.querySelector('input[name="quick-revise-option"]:checked')?.value || 'typo';
        if (!textToRevise) {
            methods.showNotification("Naskah kosong, tidak ada yang bisa direvisi.");
            methods.hideModal(modals.quickRevise);
            return;
        }
        methods.showLoading("Merevisi naskah cepat...");
        let prompt = '';
        if (quickReviseOption === 'typo') {
            prompt = `Hanya perbaiki kesalahan penulisan (typo) dan ejaan pada teks berikut. Jangan mengubah gaya bahasa, struktur kalimat, atau konten sama sekali. Kembalikan HANYA teks yang sudah diperbaiki.\n\nNaskah:\n"${textToRevise}"`;
        } else if (quickReviseOption === 'concise') {
            prompt = `Buat teks berikut menjadi lebih ringkas dan tidak bertele-tele, tanpa mengubah makna utama. Kembalikan HANYA teks yang sudah diringkas.\:n\nNaskah:\n"${textToRevise}"`;
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error((await response.json()).error.message);
            const data = await response.json();
            const revisedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, '$1') || "Gagal merevisi.";
            el.revisionOutput.value = revisedText.trim();
            methods.hideModal(modals.quickRevise);
            methods.showNotification("Revisi cepat selesai!");
        } catch (error) {
            methods.showNotification("Error revisi: " + error.message, 'error');
        } finally {
            methods.hideLoading();
        }
    },
    listFilesInDropboxFolder: async (folderPath) => {
        try {
            const dbx = DROPBOX_CONFIG.dropboxClient;
            const response = await methods.callDropboxApi(
                dbx.filesListFolder.bind(dbx), { path: folderPath, recursive: false }
            );
            return response.result.entries;
        } catch (error) {
            if (error.status === 409) { return []; }
            throw error;
        }
    },
    
syncQueue: {
    queue: new Set(),
    isSyncing: false,
    add(itemId) {
        if (!methods.checkDropboxAuth() || !navigator.onLine) return;
        this.queue.add(itemId);
        this.process();
    },
    async process() {
        if (this.isSyncing || this.queue.size === 0) return;
        this.isSyncing = true;
        
        const novelId = this.queue.values().next().value;
        
        try {
            await methods.syncSingleNovelToCloud(novelId);
        } catch (error) {
            console.error(`Gagal memproses antrean untuk novel ${novelId}:`, error);
        } finally {
            this.queue.delete(novelId);
            this.isSyncing = false;
            setTimeout(() => this.process(), 1000);
        }
    }
},
handleDeleteNovel: async (novelId) => {
    const id = Number(novelId);
    const novel = methods.getSingleLocalNovel(id);
    if (!novel) return;
    
    state.localData.novels = state.localData.novels.filter(n => n.id !== id);
    methods.saveLocalData();
    
    methods.addActivity('fas fa-trash', `Menghapus novel "${novel.projectTitle}"`);
    methods.showNotification("Novel dihapus.");
    methods.hideModal(modals.deleteConfirm);
    methods.hideModal(modals.editNovel);
    methods.renderView('app-dashboard');
    
    if (methods.checkDropboxAuth()) {
        try {
            await methods.deleteFileFromDropbox(`/Novel/${id}`);
        } catch (error) {
            methods.showNotification(`Gagal hapus novel dari cloud.`, "error");
        }
    }
},
syncSingleNovelToCloud: async (novelId) => {
    const novel = methods.getSingleLocalNovel(novelId);
    if (!novel) return;

    try {
        await methods.ensureFolderExists(`/Novel/${novelId}`);
        await methods.ensureFolderExists(`/Novel/${novelId}/Chapter`);

        for (const chapter of novel.chapters) {
            const chapterPath = `/Novel/${novelId}/Chapter/${chapter.chapterId}.json`;
            await methods.uploadFileToDropbox(chapterPath, JSON.stringify(chapter));
        }
        
        const chaptersMetadata = await Promise.all(novel.chapters.map(async c => {
            const chapterPath = `/Novel/${novelId}/Chapter/${c.chapterId}.json`;
            return {
                chapterId: c.chapterId, chapterTitle: c.chapterTitle,
                lastUpdated: c.lastUpdated,
                wordCount: (c.text || '').trim().split(/\s+/).filter(Boolean).length,
                path: chapterPath,
                url: await methods.getOrCreatePermanentLink(chapterPath)
            };
        }));

        const { chapters, ...novelMetadata } = novel;
        const totalWords = chaptersMetadata.reduce((sum, ch) => sum + ch.wordCount, 0);
        const finalNovelData = { 
            ...novelMetadata, chapters: chaptersMetadata,
            chapterCount: chaptersMetadata.length, totalWords: totalWords,
            lastUpdated: Date.now()
        };

        await methods.uploadFileToDropbox(`/Novel/${novelId}/Data.json`, JSON.stringify(finalNovelData));
        
    } catch (error) {
        methods.showNotification("Sinkronisasi gagal. Cek koneksi.", "error");
    }
},
syncDeletionToCloud: async (type, id) => {
    if (!methods.checkDropboxAuth()) return;
    methods.showNotification(`Menghapus ${type} dari cloud...`, 2000);
    try {
        if (type === 'novel') {
            await methods.deleteFileFromDropbox(`/Novel/${id}`);
            methods.showNotification("Novel berhasil dihapus dari cloud.", 2000);
        }
    } catch (error) {
        methods.showNotification(`Gagal menghapus ${type} dari cloud.`, "error");
    }
},

fetchFullNovelDataFromCloud: async (novelId, novelMetadata = null) => {
    if (!methods.checkDropboxAuth()) return null;
    
    try {
        let metadata = novelMetadata;
        
        if (!metadata) {
            const dbx = DROPBOX_CONFIG.dropboxClient;
            const dataPath = `/Novel/${novelId}/data.json`;
            
            const fileContentResponse = await methods.callDropboxApi(
                dbx.filesDownload.bind(dbx), { path: dataPath }
            );
            const fileText = await fileContentResponse.result.fileBlob.text();
            metadata = JSON.parse(fileText);
        }
        
        if (!metadata || !metadata.chapters) {
            return metadata;
        }
        
        const chapterPromises = metadata.chapters.map(async (meta) => {
            try {
                if (!meta.url) return { ...meta, text: "" };
                const response = await fetch(meta.url);
                return response.ok ? await response.json() : { ...meta, text: "Gagal memuat isi bab." };
            } catch {
                return { ...meta, text: "Error saat memuat." };
            }
        });
        
        const fetchedChapters = await Promise.all(chapterPromises);
        return { ...metadata, chapters: fetchedChapters };
        
    } catch (error) {
        return null;
    }
},
    addActivity: (iconClass, text) => {
        const newActivity = {
            icon: iconClass,
            text: text,
            time: new Date().toISOString()
        };
        let activities = JSON.parse(localStorage.getItem('revisiProActivities_v1')) || [];
        activities.unshift(newActivity);
        if (activities.length > 20) {
            activities.pop();
        }
        localStorage.setItem('revisiProActivities_v1', JSON.stringify(activities));
        methods.renderActivities();
    },
    renderActivities: () => {
        const container = doc.getElementById('activity-list');
        const activities = JSON.parse(localStorage.getItem('revisiProActivities_v1')) || [];
        if (activities.length === 0) {
            container.innerHTML = '<p style="padding: 0 var(--padding-md); color: var(--text-secondary);">Tidak ada aktivitas terbaru.</p>';
            return;
        }
        container.innerHTML = activities.map(act => {
            const time = new Date(act.time);
            const timeString = time.toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit'
            });
            return `
                <div class="activity-item">
                    <div class="activity-icon"><i class="${act.icon}"></i></div>
                    <div class="activity-text">${act.text}</div>
                    <div class="activity-time">${timeString}</div>
                </div>`;
        }).join('');
    },
    syncToAndroid: () => {
        if (isAndroidApp() && typeof Android.saveLocalData === 'function') {
            const novels = localStorage.getItem('revisiProData_v5');
            Android.saveLocalData(novels);
            if (currentUser) {
                const profileData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PROFILE}_${currentUser.uid}`);
                Android.saveUserProfile(profileData);
            }
        }
    },
    showExitWarning: () => {
        if (confirm("Anda yakin ingin keluar? Pastikan data Anda sudah tersimpan.")) {
            window.close();
        }
    }
};

window.onSignInSuccess = (idToken) => {
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    auth.signInWithCredential(credential)
        .then((result) => {
            methods.showNotification("Login berhasil!");
        })
        .catch((error) => {
            console.error("Firebase credential sign-in error:", error);
            methods.showNotification("Gagal memverifikasi login: " + error.message, 'error');
        });
};

window.onSignInFailure = (errorMessage) => {
    methods.showNotification("Login gagal: " + errorMessage);
};

window.onDataLoaded = (jsonData) => {
    try {
        const loadedData = JSON.parse(jsonData);
        if (loadedData && loadedData.novels) {
            state.localData = loadedData;
            localStorage.setItem('revisiProData_v5', jsonData);
            methods.renderDashboard();
            methods.showNotification("Data berhasil dipulihkan dari penyimpanan internal!");
        }
    } catch (e) {
        console.error("Failed to parse data from Android:", e);
        methods.showNotification("Gagal memulihkan data dari Android.", 'error');
    }
};

const addEventListeners = () => {
    const debouncedSave = debounce(() => {
        methods.saveCurrentChapter(true);
    }, 2000);

    el.chapterEditorView.addEventListener('click', async e => { 
        if (e.target.closest('#back-to-novel-btn')) {
            e.preventDefault();
            e.stopPropagation();
            if (state.isEditorDirty) {
                await methods.saveCurrentChapter(false); 
            }
            methods.renderNovelDetail(state.activeNovelId);
        }
    });

    el.novelInput.addEventListener('input', () => {
        state.isEditorDirty = true;
        debouncedSave(); 
    });

    el.mainHeaderTitle.addEventListener('input', () => {
        state.isEditorDirty = true;
        debouncedSave();
    });
    
    doc.body.addEventListener('click', (e) => {
        if (e.target.matches('.modal.is-open')) {
            methods.hideModal(e.target);
            return;
        }
        const target = e.target.closest('button, a, .novel-card, .chapter-item, [data-action="view-profile"]');
        if (!target) {
            if (el.sidebar.classList.contains('is-open')) {
                el.sidebar.classList.remove('is-open');
            }
            return;
        }
        if (target.closest('[data-action="view-profile"]')) {
            const userItem = target.closest('[data-action="view-profile"]');
            const uid = userItem.dataset.uid;
            if (uid) {
                if (modals['community-members-modal'] && modals['community-members-modal'].classList.contains('is-open')) {
                    methods.hideModal(modals['community-members-modal']);
                }
                methods.showProfileModal(uid);
            }
            return;
        }
        if (target.matches('.mobile-menu-toggle')) {
            e.stopPropagation();
            el.sidebar.classList.toggle('is-open');
            return;
        }
        if (target.dataset.action === 'close-modal') {
            methods.hideModal(target.closest('.modal'));
        }
        const viewTarget = target.dataset.view;
        const modalTarget = target.dataset.modalTarget;
        const novelId = target.closest('[data-id]')?.dataset.id;
        if (viewTarget) {
            e.preventDefault();
            methods.renderView(viewTarget);
        }
        if (modalTarget) {
            e.preventDefault();
            e.stopPropagation();
            const modal = modals[modalTarget];
            if (modal === modals.editNovel) {
                const currentNovelId = target.dataset.id || state.activeNovelId;
                const novel = methods.getSingleLocalNovel(currentNovelId);
                if (novel) {
                    state.activeNovelId = Number(currentNovelId);
                    doc.getElementById('edit-novel-title').value = novel.projectTitle;
                    doc.getElementById('edit-novel-desc').value = novel.description;
                    const coverPreview = doc.querySelector('#edit-novel-modal .cover-uploader img');
                    if (novel.coverImage) {
                        coverPreview.src = novel.coverImage;
                        coverPreview.style.display = 'block';
                    } else {
                        coverPreview.src = '';
                        coverPreview.style.display = 'none';
                    }
                    doc.querySelectorAll('#edit-novel-genres input').forEach(cb => {
                        cb.checked = (novel.genres || []).includes(cb.value)
                    });
                }
            }
            if (modal === modals['edit-profile-modal']) {
                methods.showEditProfile();
                return;
            }
            if (modal === modals['community-members-modal']) {
                methods.renderCommunityMembersList();
            }
            methods.showModal(modal);
        }
        if (target.matches('.modal-close-btn')) {
            const modal = target.closest('.modal');
            if (modal && modal.id === 'create-novel-modal') {
                methods.resetCreateNovelForm();
            }
            methods.hideModal(modal);
        }
        if (target.matches('.novel-card') && !target.closest('.delete-button, .edit-icon')) {
            methods.renderNovelDetail(novelId);
        }
        if (target.matches('.chapter-link') || target.closest('.chapter-link')) {
            e.preventDefault();
            e.stopPropagation();
            const chapterIdStr = target.closest('.chapter-item')?.dataset.chapterId;
            if (state.activeNovelId && chapterIdStr) {
                methods.renderChapterEditor(state.activeNovelId, Number(chapterIdStr));
            }
        }
        if (target.matches('[data-delete-type]')) {
            e.stopPropagation();
            const type = target.dataset.deleteType;
            const id = target.dataset.id;
            const parentId = target.dataset.parentId;
            state.itemToDelete = { type, id, parentId };
            let name = '';
            if (type === 'novel') {
                const novel = methods.getSingleLocalNovel(id);
                name = `novel "${novel?.projectTitle}"`;
            } else if (type === 'chapter') {
                const novel = methods.getSingleLocalNovel(parentId);
                const chapter = novel?.chapters.find(c => String(c.chapterId) === id);
                name = `bab "${chapter?.chapterTitle}"`;
            } else if (type === 'chat-message') {
                name = 'pesan ini';
            }
            doc.getElementById('item-to-delete-name').innerHTML = name;
            methods.showModal(modals.deleteConfirm);
        }
        if (target.id === 'add-character-btn') {
            e.preventDefault();
            methods.addCharacterInput();
        }
        if (target.id === 'confirm-delete-novel-modal') {
            const novel = methods.getSingleLocalNovel(state.activeNovelId);
            if (novel) {
                state.itemToDelete = { type: 'novel', id: state.activeNovelId, parentId: null };
                doc.getElementById('item-to-delete-name').textContent = `novel "${novel.projectTitle}"`;
                methods.showModal(modals.deleteConfirm);
            }
        }
        if (target.id === 'confirm-delete-btn') {
            const { type, id, parentId } = state.itemToDelete;
            if (type === 'novel') {
                methods.handleDeleteNovel(id);
            } else if (type === 'chapter') {
                methods.handleDeleteChapter(parentId, id);
            } else if (type === 'chat-message') {
                if (currentUser && database) {
                    database.ref('messages/' + id).remove();
                }
                methods.hideModal(modals.deleteConfirm);
            }
        }
        if (target.closest('#logout-btn-profile')) {
            methods.handleLogout();
        }
        switch (target.id) {
            case 'login-btn':
            case 'community-login-btn':
                methods.handleLogin();
                break;
            if (window.Android && typeof window.Android.startGoogleLogin === 'function') {
        window.Android.startGoogleLogin();
            } else {
            methods.handleWebLogin();}
            break;
            case 'save-chapter-btn':
                methods.saveCurrentChapter(); methods.renderNovelDetail(state.activeNovelId);
                break;
            case 'confirm-create-novel':
                methods.handleCreateNovel();
                break;
            case 'confirm-edit-novel':
                methods.handleEditNovel();
                break;
            case 'revise-button':
                methods.getAiRevision();
                break;
            case 'generate-story-btn':
                methods.getAiGeneratedStory();
                break;
            case 'save-revision-btn':
                el.novelInput.value = el.revisionOutput.value;
                methods.updateStats(el.novelInput);
                methods.showNotification('Revisi berhasil diterapkan!');
                break;
            case 'revisi-preview-apply':
                el.revisionOutput.value = doc.getElementById('preview-revisi-text').value;
                methods.hideModal(modals.revisiPreview);
                break;
            case 'generate-preview-apply':
                el.novelInput.value += (el.novelInput.value ? '\n\n' : '') + doc.getElementById('generate-preview-text').value;
                methods.updateStats(el.novelInput);
                methods.hideModal(modals.generatePreview);
                break;
            case 'copy-active-text-btn':
                let textToCopy = el.panelOriginal.offsetParent !== null ? el.novelInput.value : el.revisionOutput.value;
                navigator.clipboard.writeText(textToCopy).then(() => methods.showNotification('Teks berhasil disalin!'));
                break;
            case 'delete-chapter-btn':
                if (!state.activeChapterId) {
                    return methods.showNotification("Ini adalah bab baru yang belum disimpan.");
                }
                const novel = methods.getSingleLocalNovel(state.activeNovelId);
                const chapter = novel.chapters.find(c => String(c.chapterId) === String(state.activeChapterId));
                if (chapter) {
                    state.itemToDelete = { type: 'chapter', id: state.activeChapterId, parentId: state.activeNovelId };
                    doc.getElementById('item-to-delete-name').innerHTML = `bab "${chapter.chapterTitle}"`;
                    methods.showModal(modals.deleteConfirm);
                }
                break;
            case 'save-profile-btn':
                methods.saveProfile();
                break;
            case 'send-chat-btn':
                methods.sendChatMessage();
                break;
            case 'quick-revise-btn':
                methods.quickRevise();
                break;
                case 'force-resync-btn': methods.forceRestoreFromCloud(); break;
            case 'confirm-quick-revise-btn':
                methods.confirmQuickRevise();
                break;
        }
    });

    ['new-novel-cover', 'edit-novel-cover'].forEach(id => {
        const input = doc.getElementById(id);
        if (!input) return;
        const uploader = input.previousElementSibling;
        const previewImg = uploader.querySelector('img');
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    });

    doc.getElementById('profile-edit-photo').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                doc.getElementById('profile-edit-img').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    el.decrEditorFontBtn.addEventListener('click', () => methods.applyEditorFontSize(state.editorFontSize - 1));
    el.incrEditorFontBtn.addEventListener('click', () => methods.applyEditorFontSize(state.editorFontSize + 1));
    el.novelInput.addEventListener('input', () => methods.updateStats(el.novelInput));
    el.revisionOutput.addEventListener('input', () => methods.updateStats(el.revisionOutput));
    el.viewOriginalBtn.addEventListener('click', () => {
        el.editorGrid.classList.add('view-mode-original');
        el.editorGrid.classList.remove('view-mode-revisi');
        el.viewOriginalBtn.classList.add('active');
        el.viewRevisiBtn.classList.remove('active');
    });
    el.viewRevisiBtn.addEventListener('click', () => {
        el.editorGrid.classList.add('view-mode-revisi');
        el.editorGrid.classList.remove('view-mode-original');
        el.viewRevisiBtn.classList.add('active');
        el.viewOriginalBtn.classList.remove('active');
    });
    el.novelDetailView.addEventListener('click', e => {
        const target = e.target.closest('button, a');
        if (!target) return;
        if (target.id === 'back-to-dashboard-btn') {
            e.preventDefault();
            e.stopPropagation();
            methods.renderView('app-dashboard');
        } else if (target.id === 'add-chapter-btn') {
            e.preventDefault();
            e.stopPropagation();
            methods.renderChapterEditor(state.activeNovelId, 'new');
        }
    });
    doc.getElementById('community-view').addEventListener('click', e => {
        if (e.target.closest('#back-to-dashboard-community-btn')) {
            e.preventDefault();
            e.stopPropagation();
            methods.renderView('app-dashboard');
        }
    });
    doc.getElementById('user-profile-view').addEventListener('click', e => {
        if (e.target.closest('#back-to-dashboard-profile-btn')) {
            e.preventDefault();
            e.stopPropagation();
            methods.renderView('app-dashboard');
        }
    });
    doc.getElementById('relink-dropbox-btn').addEventListener('click', () => {
        methods.authenticateWithDropbox(true);
        methods.hideModal(modals.backupRestore);
    });
    doc.getElementById('display-settings-modal').addEventListener('change', e => {
        const target = e.target;
        if (target.name === 'theme' || target.name === 'font' || target.name === 'animation') {
            const isExclusive = target.closest('#exclusive-themes-container');
            if (isExclusive && !currentUser) {
                methods.showNotification("Silakan login untuk menggunakan fitur eksklusif!", 'info');
                const savedTheme = localStorage.getItem('userTheme') || 'dark';
                const themeRadio = doc.querySelector(`input[name="theme"][value="${savedTheme}"]`);
                if (themeRadio) themeRadio.checked = true;
                return;
            }
            const theme = doc.querySelector('input[name="theme"]:checked').value;
            const font = doc.querySelector('input[name="font"]:checked').value;
            const animation = doc.querySelector('input[name="animation"]:checked').value;
            methods.applyDisplaySettings(theme, font, animation);
        }
    });
    doc.getElementById('system-font-size-slider').addEventListener('input', e => {
        const value = parseFloat(e.target.value);
        root.style.setProperty('--font-size-base', value + 'rem');
        e.target.nextElementSibling.textContent = `${value}rem`;
        localStorage.setItem('system-font-size-slider', value);
    });
    el.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            methods.sendChatMessage();
        }
    });
    let isDownNovel = false;
    let startXNovel;
    let scrollLeftNovel;
    el.novelListScroller.addEventListener('mousedown', (e) => {
        isDownNovel = true;
        el.novelListScroller.classList.add('active');
        startXNovel = e.pageX - el.novelListScroller.offsetLeft;
        scrollLeftNovel = el.novelListScroller.scrollLeft;
    });
    el.novelListScroller.addEventListener('mouseleave', () => {
        isDownNovel = false;
        el.novelListScroller.classList.remove('active');
    });
    el.novelListScroller.addEventListener('mouseup', () => {
        isDownNovel = false;
        el.novelListScroller.classList.remove('active');
    });
    el.novelListScroller.addEventListener('mousemove', (e) => {
        if (!isDownNovel) return;
        e.preventDefault();
        const x = e.pageX - el.novelListScroller.offsetLeft;
        const walk = (x - startXNovel) * 2;
        el.novelListScroller.scrollLeft = scrollLeftNovel - walk;
    });
    el.chapterList.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            e.preventDefault();
            el.chapterList.scrollTop += e.deltaY;
        }
    });
    el.quickReviseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        methods.quickRevise();
    });
    el.confirmQuickReviseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        methods.confirmQuickRevise();
    });
    window.addEventListener('beforeunload', (event) => {
        if (state.isEditorDirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
        window.addEventListener('popstate', () => {
        const activeView = document.querySelector('.main-view.active');
        if (!activeView) return;
        
        switch (activeView.id) {
            case 'chapter-editor-view':
                document.getElementById('back-to-novel-btn')?.click();
                break;
            case 'novel-detail-view':
                document.getElementById('back-to-dashboard-btn')?.click();
                break;
            case 'user-profile-view':
            case 'community-view':
                methods.renderView('app-dashboard');
                break;
        }
    });
    const showDownloadBtn = doc.getElementById('show-download-modal-btn');
if (showDownloadBtn) {
    showDownloadBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah link default
        methods.showModal(modals.downloadApp); // Tampilkan modal download
    });
}
};

const init = () => {
    methods.createAllModals();
    methods.loadInitialState();
    addEventListeners();
    methods.handleDropboxRedirect();
    if (isAndroidApp()) {
        if (el.downloadLinkContainer) {
            el.downloadLinkContainer.remove();
        }
    }
    methods.initFirebase();
    methods.renderView('app-dashboard');
    history.replaceState(null, '', '#app-dashboard');
    methods.updateNativeTheme();
};

init();
});
//]]>