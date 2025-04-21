/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        const bodyText = document.body.innerText;

        const keywords = request.keywords || [];
        const matched = [];

        for (const word of keywords) {
            const regex = new RegExp(`${word}`, 'gi');
            const matches = bodyText.match(regex);
            if (matches) {
                matched.push({ keyword: word, count: matches.length });
            }
        }

        sendResponse({ matched });

        // ✅ 告诉 Chrome：我会异步调用 sendResponse
        return true;
    }
});
