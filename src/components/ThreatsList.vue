<script setup>
    import { defineProps, defineEmits, ref, inject, watch, onMounted } from 'vue';
    import ThreatItem from "./ThreatItem.vue";

    const ThreatsList = inject('threatsList', ref([]));
    const threatsNum = ref(ThreatsList.value.length);


    /* 作用，移除threat提示后要干嘛?TODO */
    const removeItem = (id) => {
        ThreatsList.value = ThreatsList.value.filter(item => item.id !== id);
    }

    /* 当删除时更新 */
    watch(ThreatsList, (newList) => {
        sessionStorage.setItem('matchedThreats', JSON.stringify(newList));
        threatsNum.value = ThreatsList.value.length;
    }, { deep: true });

    /*这一句只在脚本初始化阶段运行了一次，所以无法更新
    sessionStorage.setItem('matchedThreats', JSON.stringify(ThreatsList.value));*/


    const handleClick = (keyword) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'highlightKeyword',
                keyword: keyword
            });
        });
    }
    
</script>

<template>
    <span class="prompt-text">
        Find {{threatsNum}} possible sensitive information
    </span>
    <div>
        <ThreatItem v-for="item in ThreatsList"
                    :key="item.id"
                    @click="handleClick(item.content)"
                    :id="item.id"
                    :threatPriority="item.threatPriority"
                    :attribute="item.attribute"
                    :content="item.content"
                    @remove="removeItem" />
    </div>

</template>