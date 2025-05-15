/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */
// 在contentScript.js开头添加样式注入
import * as openpgp from './openpgp.min.mjs';
const Style = document.createElement('Style');
Style.textContent = `
    .highlight-sensitive {
        background-color: #ffeb3b !important;
        color: #000 !important;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    .active-highlight {
        background-color: #ff5722 !important;
        animation: pulse 1s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(Style);

let originalHTML = '';//用来存储原始HTML内容
let cachedMatchedKeywords = [];

async function startEncryption(bodyText, armoredPublicKey) {
    try {
        // 检查公钥是否完整
        if (!armoredPublicKey.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
            throw new Error('Error with publicKey format');
        }

        const publicKeyObj = await openpgp.readKey({ armoredKey: armoredPublicKey });
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: bodyText }),
            encryptionKeys: publicKeyObj
        });
        console.log("the result is ", encrypted);
        return encrypted;
        //替换compose中原来的内容
        //insertEncryptedText(encrypted);
    } catch (error) {
        console.error('Fail to encrpyt: ', error);
        alert('Fail to encrpyt: ' + error.message);
    }
}
function insertEncryptedText(encryptedText) {
    const composeEditor = document.querySelector('div.editable');
    if (composeEditor) {
        composeEditor.textContent = '\n' + encryptedText + '\n';
    } else {
        alert("Compose editor not found.");
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startEncryption') {
        let bodyText = getBodyText();
        //startEncryption是异步函数，返回的是 Promise
        startEncryption(bodyText, request.publicKey).then(encrypted => {
            sendResponse({ encryptedMessage: encrypted });
        });
        return true;
    }

    if (request.action === 'getEncryptedMessage') {
        // 假设加密的邮件内容在页面的某个元素中，例如 class 为 'encrypted-message'
        const encryptedElement = getBodyText();
        console.log("The element is ", encryptedElement);
        if (encryptedElement && encryptedElement.startsWith('-----BEGIN PGP MESSAGE-----')) {
            sendResponse({ encryptedMessage: encryptedElement });
        } else {
            sendResponse({ encryptedMessage: null });
        }
    }

    if (request.action === 'startDetection') {
        originalHTML = document.body.innerHTML;
        let bodyText = getBodyText();

        const matched = matchKeywords(bodyText, request.keywords);
        console.log("the whole email is " + bodyText);

        sendResponse({ matched, bodyText });
        return true;
    }


    if (request.action === 'highlightKeyword') {
        const keyword = request.keyword;
        const safeKeyword = CSS.escape(keyword);
        document.body.innerHTML = originalHTML;
        const allKeywords = [...cachedMatchedKeywords, { keyword, count: 1 }];
        const sortedKeywords = allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);
        highlightSensitiveWords(sortedKeywords, false);
        // 重新在全页里高亮这个关键词

        const targets = document.querySelectorAll(`mark.highlight-sensitive[data-keyword="${safeKeyword}"]`);

        if (targets.length > 0) {
            targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

            targets.forEach(target => {
                target.classList.add('active-highlight');
            });

            setTimeout(() => {
                targets.forEach(target => {
                    target.classList.remove('active-highlight');
                });
            }, 2000);
        }
    }

    if (request.action === 'removeHighlight') {
        const keyword = request.keyword;
        const safeKeyword = CSS.escape(keyword);

        // 清除所有相关高亮标记
        document.querySelectorAll(`mark.highlight-sensitive[data-keyword="${safeKeyword}"]`)
            .forEach(el => el.replaceWith(document.createTextNode(el.textContent)));

        // 更新缓存
        cachedMatchedKeywords = cachedMatchedKeywords.filter(item => item.keyword !== keyword);
    }
});

function getBodyText() {
    let bodyText = '';
    const isComposePage = window.location.href.includes('compose=');
    if (isComposePage) {
        //originalHTML = document.body.innerHTML;
        //获取compose里面的内容，在div.editable里面
        const composeEditor = document.querySelector('div.editable');
        if (composeEditor) {
            bodyText = composeEditor.innerText;
        }
    }
    else {
        // 获得邮件中最重要的正文部分 
        const msgBodies = document.querySelectorAll('div.a3s');
        msgBodies.forEach(el => {
            bodyText += el.innerText + '\n';
        });
    }
    return bodyText;
}

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


//转义正则特殊字符
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightSensitiveWords(matched, clearPrevious = true) {
    const body = document.body;
    if (!body) return;
    console.log("body is "+body);

    
    const sortedMatched = matched.sort((a, b) => b.keyword.length - a.keyword.length);
    sortedMatched.forEach(item => {
        const keyword = item.keyword;
        if (!keyword) return;
        //console.log("keyword is " + keyword);

        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        walkAndHighlight(body, regex, keyword);
    });
}


function walkAndHighlight(node, regex, keyword) {
    if (node.nodeType === 3) {
        //纯text节点
        const span = document.createElement('span');
        span.innerHTML = node.data.replace(regex, (match) =>
            `<mark class="highlight-sensitive" data-keyword="${keyword}">${match}</mark>`
        );
        node.replaceWith(span);
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        Array.from(node.childNodes).forEach(child => walkAndHighlight(child, regex, keyword));
    }
}
