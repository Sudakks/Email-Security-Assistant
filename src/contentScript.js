/* һֱ���������⣺��Ϊ���ҳ���Ѿ���������,
����û�б�ע��ű�, ��Ҫˢ��ҳ��
ʹ�ű�ע�뵽ҳ����, Ȼ��ſ��Է�����Ϣ */
//alert("Content script loaded!");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchContent") {
        const content = document.body.innerText;
        console.log("Sending content:", content);
        sendResponse(content);
    }
});