<template>
    <button class="homepageButton" style="background-color: #4CAF50;" @click="sendSignal">Start to detect current email</button>
    <button class="homepageButton" style="background-color: #FF9800;" @click="startEncryption">Encrypt the whole email</button>
    <div>
        <!-- 文件上传按钮 -->
        <button class="homepageButton" style="background-color: #2196F3;" @click="decryptEmail">Decrypt the whole email</button>
        <input type="file" @change="handlePrivateKeyUpload" accept=".asc,.pgp,.txt" />
    </div>
    <ThreatsList />

    <div v-if="decryptedMessage">
        <label class="prompt-text">Decrypted Message:</label>
        <pre class="encrypted-output"
             @click="copyToClipboard"
             title="Click to copy">
    {{ decryptedMessage }}
    </pre>
    </div>

    <div v-if="encryptedMessage">
        <label class="prompt-text">Encrypted Message:</label>
        <pre class="encrypted-output"
             @click="copyToClipboard"
             title="Click to copy">
  {{ encryptedMessage }}
</pre>
    </div>
    <v-expansion-panels>
        <v-expansion-panel title="Title"
                           text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima">
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<style scoped>
    .label {
        display: block;
        margin: 5px 5px;
        font-weight: bold;
        color: #444;
        font-size: 15px;
        padding: 5px 10px;
    }

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
    .encrypted-output {
        white-space: pre-wrap;
        word-wrap: break-word;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
        /*max-height: 300px;*/
        overflow-y: auto;
        margin: 10px auto;
        width: 90%;
        cursor: copy; /* 鼠标样式提示可复制 */
    }

        .encrypted-output:hover {
            background-color: #EEF7FA;
        }
</style>

<script setup>
    import ThreatsList from "../components/ThreatsList.vue"
    import { provide, ref, watch } from 'vue'
    import axios from 'axios'
    import * as openpgp from 'openpgp';
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(encryptedMessage.value);
            alert("✅ Message copied to clipboard!");
        } catch (err) {
            console.error("Copy failed:", err);
            alert("❌ Copy failed.");
        }
    };
    //用于存储privateKey和解密后的文件内容
    const privateKeyArmored = ref('');
    const decryptedMessage = ref('');
    const encryptedMessage = ref('');

    // 处理私钥文件上传
    const handlePrivateKeyUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            privateKeyArmored.value = await file.text();
            //privateKeyArmored.value = await openpgp.readPrivateKey({ armoredKey: await file.text() });
        }
    };

    const decryptEmail = async () => {
        if (!privateKeyArmored.value) {
            alert('Please upload your private key first.');
            return;
        }
        else {
            console.log("The private value is ", privateKeyArmored.value);
        }

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            const url = tab.url || '';

            const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored.value });
            console.log("the private key is " + privateKey);
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ['contentScript.js']
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('contentScript injection failed:', chrome.runtime.lastError.message);
                    } else {
                        chrome.tabs.sendMessage(tab.id, { action: 'getEncryptedMessage' }, async (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Message error:', chrome.runtime.lastError.message);
                            } else {
                                if (response?.encryptedMessage) {
                                    console.log('Received Encrypted Message:', response.encryptedMessage);
                                    const message = await openpgp.readMessage({
                                        armoredMessage: response.encryptedMessage
                                    });
                                    const { data: decrypted } = await openpgp.decrypt({
                                        message,
                                        decryptionKeys: privateKey // 或 decryptedKey
                                    });
                                    decryptedMessage.value = decrypted;
                                }
                                else {
                                    alert('No encrypted message found on the page.');
                                }
                            }
                        });
                    }
                }
            );
        });
    };


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

    let itemIdCounter = 0;
    const updateThreatsList = () => {
        threatsList.value = [];
        itemIdCounter = 0; 

        detectedCustomedKeywords.value.forEach(item => {
            threatsList.value.push({
                id: ++itemIdCounter,
                threatPriority: 'high',
                attribute: 'Customed Keywords Detected',
                content: item.keyword
            });
        });

        detectedGPTInfo.value.forEach(item => {
            threatsList.value.push({
                id: ++itemIdCounter,
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
                                const tmp = detectedGPTInfo.value;
                                /*chrome.tabs.sendMessage(tab.id, { action: 'addGPTInfo', data:tmp }, async (another) => {
                                    if (chrome.runtime.lastError) {
                                        console.error('Error sending another action:', chrome.runtime.lastError.message);
                                    } else {
                                        console.log('Successfully sent another action:', anotherResponse);
                                        // 可以根据 anotherResponse 处理后续逻辑
                                    }
                                });*/
                                /*手动控制，每次更新后再更新threatsList
                                *threatsList 应该自己管理自己的生命周期
                                *不要依赖 detectedCustomedKeywords 或 detectedGPTInfo 的初始值
                                *得到两个数组的值后再更新*/
                                updateThreatsList();
                                chrome.tabs.sendMessage(tab.id, { action: 'highlightAll', data: threatsList.value }, async (response) => {
                                });
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
            const response = await axios.post(
                'http://localhost:3000/api/detect-threats', // 后端地址
                { emailBody },
                { headers: { 'Content-Type': 'application/json' } }
            );

            return response.data;
        } catch (error) {
            console.error('Detection failed:', error);
            alert(`检测失败: ${error.response?.data?.error || error.message}`);
            return [];
        }
    }



    const startEncryption = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            const url = tab.url || '';

            const myPublicKey = localStorage.getItem('myPublicKey');
            if (!myPublicKey || !myPublicKey.includes('BEGIN PGP PUBLIC KEY')) {
                alert("Public Key is invalid or none");
                return;
            }
            else {
                alert("the valid is " + myPublicKey);
            }

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ['contentScript.js']
                },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('contentScript injection failed:', chrome.runtime.lastError.message);
                    } else {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'startEncryption',
                            publicKey: myPublicKey, // 只传字符串
                        }, (response) => {
                            if (response && response.encryptedMessage) {
                                encryptedMessage.value = response.encryptedMessage;
                            }
                        });
                    }
                }
            );
        });
    };
</script>
