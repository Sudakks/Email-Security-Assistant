chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "detectEmail") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "fetchContent" }, (response) => {
                sendResponse(response); // 响应传递给 Homepage.vue
            });
        });
        return true; // 保持通道开放
    }
});