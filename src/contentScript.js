/* һֱ���������⣺��Ϊ���ҳ���Ѿ���������,
����û�б�ע��ű�, ��Ҫˢ��ҳ��
ʹ�ű�ע�뵽ҳ����, Ȼ��ſ��Է�����Ϣ */
//alert("Content script loaded!");
// src/contentScript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        // ��ȡҳ�洿�ı�
        const bodyText = document.body.innerText;

        console.log('[Email Assistant] html text��', bodyText);

        // �����Ҫ�ѽ�����ظ� popup ҳ��
        sendResponse({ text: bodyText });
    }
});
