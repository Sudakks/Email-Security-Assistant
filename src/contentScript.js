/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */
//alert("Content script loaded!");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchContent") {
        const content = document.body.innerText;
        console.log("Sending content:", content);
        sendResponse(content);
    }
});