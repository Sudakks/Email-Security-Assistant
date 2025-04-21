chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "detectEmail") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fetchContent" }, (response) => {
                sendResponse(response); // ��Ӧ���ݸ� Homepage.vue
            });
        });
        return true; // ����ͨ������
    }
});