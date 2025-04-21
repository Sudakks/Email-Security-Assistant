/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */
//alert("Content script loaded!");
// src/contentScript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        // 提取页面纯文本
        const bodyText = document.body.innerText;

        console.log('[Email Assistant] html text：', bodyText);

        // 如果需要把结果返回给 popup 页面
        sendResponse({ text: bodyText });
    }
});
