/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        /* 获得邮件中最重要的正文部分 */
        const msgBodies = document.querySelectorAll('div.a3s');
        let bodyText = '';
        msgBodies.forEach(el => {
            bodyText += el.innerText + '\n';
        });

        const matched = matchKeywords(bodyText, request.keywords);
        console.log('[Email Assistant] Matched in Gmail body:', matched);
        sendResponse({ matched, bodyText });
        return true;
    }
});

function matchKeywords(text, keywords = []) {
    const matched = [];
    for (const word of keywords) {
        const regex = new RegExp(`${escapeRegExp(word)}`, 'gi');
        const m = text.match(regex);
        if (m) {
            matched.push({ keyword: word, count: m.length });
        }
    }
    return matched;
}

/*
 * 转义正则特殊字符
 */
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

