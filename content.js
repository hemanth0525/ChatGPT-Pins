function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class ChatGPTPinner {
    constructor() {
        this.pinnedChats = [];
        this.loadPinnedChats();
        this.initSidebarObserver();
    }

    loadPinnedChats() {
        chrome.storage.local.get('pinnedChats', (result) => {
            this.pinnedChats = result.pinnedChats || [];
            this.renderPinnedChats();
        });
    }

    initSidebarObserver() {
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('nav');
            if (sidebar && !document.querySelector('.pinned-chats-section')) {
                this.createPinnedChatsSection(sidebar);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    createPinnedChatsSection(sidebar) {
        const exploreSection = sidebar.querySelector('a[href="/gpts"]')?.closest('div');
        if (!exploreSection) return;

        const section = document.createElement('div');
        section.className = 'pinned-chats-section';
        section.innerHTML = `
        <h3>Pinned Chats</h3>
        <ul class="pinned-chats-list"></ul>
        <button class="pin-chat-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
          <span>Pin Current Chat</span>
        </button>
      `;

        exploreSection.insertAdjacentElement('afterend', section);

        section.querySelector('.pin-chat-button').addEventListener('click', () => {
            this.pinCurrentChat();
        });

        this.renderPinnedChats();
    }

    pinCurrentChat() {
        const title = document.title.replace(' - ChatGPT', '').trim();
        const url = window.location.href;
        const newChat = {
            id: generateId(),
            title: title || 'New Chat',
            url: url
        };

        this.pinnedChats.push(newChat);
        this.savePinnedChats();
    }

    unpinChat(id) {
        this.pinnedChats = this.pinnedChats.filter(chat => chat.id !== id);
        this.savePinnedChats();
    }

    savePinnedChats() {
        chrome.storage.local.set({ pinnedChats: this.pinnedChats }, () => {
            this.renderPinnedChats();
        });
    }

    renderPinnedChats() {
        const list = document.querySelector('.pinned-chats-list');
        if (!list) return;

        list.innerHTML = '';

        this.pinnedChats.forEach(chat => {
            const li = document.createElement('li');
            li.innerHTML = `
          <a href="${chat.url}" title="${chat.title}">${chat.title}</a>
          <button class="unpin-button" data-id="${chat.id}" title="Unpin Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>
          </button>
        `;

            li.querySelector('.unpin-button').addEventListener('click', (e) => {
                this.unpinChat(chat.id);
            });

            list.appendChild(li);
        });
    }
}

new ChatGPTPinner();