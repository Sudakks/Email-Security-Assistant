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
        /*background-color: #4CAF50;*/
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
        /*max-width: 400px;  限制最大宽度 */
        margin: 5px auto; /* 左右自动居中 */
    }
</style>

<script setup>
    import ThreatsList from "../components/ThreatsList.vue"
    import { provide, ref } from 'vue'

    const detectedKeywords = ref([]);
    const saved = sessionStorage.getItem('matchedThreats');
    if (saved) {
        detectedKeywords.value = JSON.parse(saved);
    }
    provide("detectedKeywords", detectedKeywords);




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
                        chrome.tabs.sendMessage(tab.id, { action: 'startDetection', keywords }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Message error:', chrome.runtime.lastError.message);
                            } else {
                                alert('✅ the content is  ：' + response.matched.map(k => `${k.keyword}（${k.count} 次）`).join('\n'));
                                //alert("Text is: " + response.bodyText);
                                detectedKeywords.value = response.matched;

                                /*
                                * 当切换页面时，detected到的敏感词数组不会被清空
                                * 而当关闭插件再打开时，此数组清空，需要重新检测
                                */
                                sessionStorage.setItem('matchedThreats', JSON.stringify(response.matched));
                            }
                        });
                    }
                }
            );
        });
    };
</script>
