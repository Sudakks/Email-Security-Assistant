<template>
    <button class="homepageButton" style="background-color: #4CAF50;" @click="sendSignal">Start to detect current email</button>
    <button class="homepageButton" style="background-color: #FF9800;">Encrypt the whole email</button>
    <ThreatsList />
    <v-expansion-panels>
        <v-expansion-panel title="Title"
                           text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima">
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<style scoped>
    .homepageButton {
        align-items: center;
        border: none;
        border-radius: 2px;
        color: white;
        padding: 4px 32px;
        font-size: 15px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        display: block;
        width: 94%;
        margin: 5px auto; 
    }
</style>

<script setup>
    import ThreatsList from "../components/ThreatsList.vue"
    import { provide, ref, watch } from 'vue'
    import axios from 'axios'

    const threatsList = ref([]);
    const detectedCustomedKeywords = ref([]);
    const detectedGPTInfo = ref([]);
    const saved = sessionStorage.getItem('matchedThreats');
    if (saved) {
        threatsList.value = JSON.parse(saved);
    }

    provide("threatsList", threatsList);

    const saveThreatsList = () => {
        sessionStorage.setItem('matchedThreats', JSON.stringify(threatsList.value));
    };

    const updateThreatsList = () => {
        threatsList.value = [];

        detectedCustomedKeywords.value.forEach(item => {
            threatsList.value.push({
                id: threatsList.value.length + 1,
                threatPriority: 'high',
                attribute: 'Customed Keywords Detected',
                content: item.keyword
            });
        });

        detectedGPTInfo.value.forEach(item => {
            threatsList.value.push({
                id: threatsList.value.length + 1,
                threatPriority: item.threatPriority,
                attribute: item.attribute,
                content: item.content
            });
        });

        /* 手动更新threatsList，而不用监听detectedGPTInfo的方法，因为切换页面的时候会自动清零 */
        saveThreatsList();
    };

    const sendSignal = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            const url = tab.url || '';
            let hostname = '';
            try {
                hostname = new URL(url).hostname
            } catch (e) {
                alert("Error to catch hostname: " + hostname);
            }

            if (!hostname.endsWith('mail.google.com')) {
                alert("⚠️Not on Gmail. Please switch to Gmail and start to detect.");
                return;
            }

            const storedKeywords = localStorage.getItem('customKeywords');
            const keywords = storedKeywords ? JSON.parse(storedKeywords) : [];


            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ['contentScript.js']
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('contentScript injection failed:', chrome.runtime.lastError.message);
                    } else {
                        chrome.tabs.sendMessage(tab.id, { action: 'startDetection', keywords }, async (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Message erro                                * r:', chrome.runtime.lastError.message);
                            } else {
                                alert('✅ the content is  ：' + response.matched.map(k => `${k.keyword}（${k.count} 次）`).join('\n'));
                                //alert("Text is: " + response.bodyText);
                                detectedCustomedKeywords.value = response.matched;
                                detectedGPTInfo.value = await ChatGPTDetection(response.bodyText);
                                /*手动控制，每次更新后再更新threatsList
                                *threatsList 应该自己管理自己的生命周期
                                *不要依赖 detectedCustomedKeywords 或 detectedGPTInfo 的初始值
                                *得到两个数组的值后再更新*/
                                updateThreatsList();
                                /*
                                * 当切换页面时，detected到的敏感词数组不会被清空
                                * 而当关闭插件再打开时，此数组清空，需要重新检测
                                *sessionStorage.setItem('matchedKeywordsThreats', JSON.stringify(response.matched));
                                */
                            }
                        });
                    }
                }
            );
        });
    };
    const ChatGPTDetection = async (emailBody) => {
        try {
            const apiKey = 'sk-E7kH3grrS6hOOHH2HB2iKcnWIomiiaXd6LnM6rT32hd7bBE5' // 记得替换为你的实际 key

            const response = await axios.post(
                'https://api.chatanywhere.org/v1/chat/completions',
                {
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "user",
                        content:
                        `Please carefully analyze the following email content and extract any sensitive information, including:
                        - Phone numbers
                        - Physical addresses
                        - Identification numbers (e.g., ID card, passport)
                        - Email addresses
                        - Bank account numbers
                        - Credit card numbers
                        - Passwords

                        Please return ONLY the JSON array, without any additional text, without any markdown formatting (no \`\`\`json), and without explanations.

                        Each item should have:
                        - "threatPriority": "low", "medium", or "high" (fixed priority based on the type)
                            - ID number, bank accounts, and passwords => high
                            - phone numbers, addresses => medium
                            - email addresses => low
                        - "attribute": The type of sensitive information (e.g., "Phone Number Exposed", "Email Exposed")
                        - "content": The exact detected sensitive information
                        
                        If no sensitive information is found, return an empty array [].
                        
                        Email content:\n${emailBody}`
                    }],
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            const GptFetchedInfo = response.data.choices[0].message.content;
            alert("response is: " + GptFetchedInfo);
            const parsedThreats = JSON.parse(GptFetchedInfo.trim().replace(/^```json|```$/g, ''));
            console.table(parsedThreats);
            return parsedThreats;
            /* 
                *为什么这里还要再调用一次updateThreatsList?
                *因为ChatGPTDetection是一个async异步函数
                *所以sendSignal调用完它之后，其实detectedGPTInfo还没有拿到它的数据
                *updateThreatsList();
            */
        } catch (error) {
            console.error('error is:', error.response?.data || error.message);
            alert(`wrong: ${error.response?.data?.error?.message || error.message}`);
            return [];
        }
    }
</script>
