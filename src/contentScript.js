/* 一直以来的问题：因为这个页面已经加载完了,
它并没有被注入脚本, 需要刷新页面
使脚本注入到页面中, 然后才可以发送消息 */
// 在contentScript.js开头添加样式注入
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


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        /* 获得邮件中最重要的正文部分 */
        originalHTML = document.body.innerHTML;
        const msgBodies = document.querySelectorAll('div.a3s');
        let bodyText = '';
        msgBodies.forEach(el => {
            bodyText += el.innerText + '\n';
        });

        const matched = matchKeywords(bodyText, request.keywords);
        //console.log('[Email Assistant] Matched in Gmail body:', matched);
        //cachedMatchedKeywords = matched;
        //cachedMatchedKeywords = [...cachedMatchedKeywords].sort((a, b) => b.keyword.length - a.keyword.length);

        //console.log("At first: " + cachedMatchedKeywords);

        sendResponse({ matched, bodyText });
        return true;
    }


    if (request.action === 'highlightKeyword') {
        const keyword = request.keyword;
        const safeKeyword = CSS.escape(keyword);
        //console.log("original is " + originalHTML);
        document.body.innerHTML = originalHTML;
        //console.log("new HTML is " + document.body.innerHTML);
        const allKeywords = [...cachedMatchedKeywords, { keyword, count: 1 }];
        const sortedKeywords = allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);
        highlightSensitiveWords(sortedKeywords, false);
        // 先清除之前的高亮（如果有）
        /*document.querySelectorAll('mark.highlight-sensitive')
            .forEach(el => el.replaceWith(document.createTextNode(el.textContent)));*/

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

        // 更新缓存（可选）
        cachedMatchedKeywords = cachedMatchedKeywords.filter(item => item.keyword !== keyword);
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

