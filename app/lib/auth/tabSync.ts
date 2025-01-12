type SyncMessage = {
    type: 'AUTH_SYNC';
    action: 'LOGIN' | 'LOGOUT' | 'REFRESH' | 'VERIFY' | 'CONFLICT_CHECK' | 'CONFLICT_RESOLVE';
    data?: any;
    timestamp: number;
    tabId: string;
};

export const TabSync = {
    channel: new BroadcastChannel('trustpool_auth_sync'),
    tabId: Math.random().toString(36).substring(2, 9),
    activeTab: null as string | null,

    broadcast(message: Omit<SyncMessage, 'timestamp' | 'tabId'>) {
        try {
            this.channel.postMessage({
                ...message,
                timestamp: Date.now(),
                tabId: this.tabId
            });
        } catch (error) {
            console.error('Failed to broadcast message:', error);
        }
    },

    subscribe(callback: (message: SyncMessage) => void) {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'AUTH_SYNC') {
                callback(event.data);
            }
        };

        // Announce this tab's presence
        this.broadcast({
            type: 'AUTH_SYNC',
            action: 'CONFLICT_CHECK'
        });

        this.channel.addEventListener('message', handler);
        return () => {
            this.channel.removeEventListener('message', handler);
            if (this.activeTab === this.tabId) {
                // Notify other tabs that the active tab is closing
                this.broadcast({
                    type: 'AUTH_SYNC',
                    action: 'CONFLICT_RESOLVE',
                    data: { closing: true }
                });
            }
        };
    },

    setActiveTab(tabId: string) {
        this.activeTab = tabId;
    },

    isActiveTab() {
        return this.activeTab === this.tabId;
    },

    cleanup() {
        this.channel.close();
    }
}; 