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

let cachedMatchedKeywords = [];


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startDetection') {
        /* 获得邮件中最重要的正文部分 */
        const msgBodies = document.querySelectorAll('div.a3s');
        let bodyText = '';
        msgBodies.forEach(el => {
            bodyText += el.innerText + '\n';
        });

        const matched = matchKeywords(bodyText, request.keywords);
        //console.log('[Email Assistant] Matched in Gmail body:', matched);
        cachedMatchedKeywords = matched;
        cachedMatchedKeywords = [...cachedMatchedKeywords].sort((a, b) => b.keyword.length - a.keyword.length);

        //console.log("At first: " + cachedMatchedKeywords);

        sendResponse({ matched, bodyText });
        return true;
    }


    if (request.action === 'highlightKeyword') {
        //console.log(cachedMatchedKeywords);
        const keyword = request.keyword;
        //alert("the keyword is: " + keyword);
        //清除旧高亮
        document.querySelectorAll(`mark[data-keyword="${keyword}"]`)
            .forEach(el => el.classList.remove('active-highlight'));
        const targetItems = cachedMatchedKeywords.filter(item => item.keyword === keyword);

        if (targetItems.length > 0) {
            

            highlightSensitiveWords(targetItems, true);
            const targets = document.querySelectorAll(`mark.highlight-sensitive[data-keyword="${keyword}"]`);
            if (targets.length > 0) {
                targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                targets.forEach(target => {
                    target.classList.add('active-highlight');
                })
                setTimeout(() => {
                    targets.forEach(target => {
                        target.classList.remove('active-highlight');
                    });
                }, 2000);
            }
        }
        else {
            //说明这个是GPT生成的
            highlightSensitiveWords([{ keyword: keyword, count: 1 }], true);
            const targets = document.querySelectorAll(`mark.highlight-sensitive[data-keyword="${keyword}"]`);
            if (targets.length > 0) {
                targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                targets.forEach(target => {
                    target.classList.add('active-highlight');
                })
                setTimeout(() => {
                    targets.forEach(target => {
                        target.classList.remove('active-highlight');
                    });
                }, 2000);
            }
        }
        /*else if (targetItems.length === 0) {
            cachedMatchedKeywords.push({ keyword, count: 1 }); // 默认 count 为 1
            highlightSensitiveWords([{ keyword: keyword, count: 1 }], true);

        }*/
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


//转义正则特殊字符
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightSensitiveWords(matched, clearPrevious = true) {
    const body = document.body;
    if (!body) return;
    console.log("body is "+body);

    if (clearPrevious) {
        document.querySelectorAll('mark.highlight-sensitive')
            .forEach(el => el.replaceWith(document.createTextNode(el.textContent)));
    }


    matched.forEach(item => {
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

