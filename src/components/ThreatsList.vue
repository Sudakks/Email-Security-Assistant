<script setup>
    import { defineProps, defineEmits, ref, inject, watch, onMounted } from 'vue';
    import ThreatItem from "./ThreatItem.vue";


    
    /*const ThreatsList = ref([
        { id: 1, threatPriority: "high", attribute: "ID Number Detected", content: "389568xxxx93858" },
        { id: 2, threatPriority: "medium", attribute: "Email Exposed", content: "example@email.com" },
        { id: 3, threatPriority: "low", attribute: "Weak Password", content: "password123" }
    ]);*/

    const ThreatsList = ref([]);
    const detectedKeywords = inject('detectedKeywords', ref([]));


    watch(detectedKeywords, (newKeywords) => {
        ThreatsList.value = []; // 清空旧的
        newKeywords.forEach((item) => {
            ThreatsList.value.push({
                id: ThreatsList.value.length + 1,
                threatPriority: "high",
                attribute: "Customed Keywords Detected",
                content: item.keyword
            });
        });
    }, { immediate: true });

    /* 作用，移除threat提示后要干嘛 */
    const removeItem = (id) => {
        ThreatsList.value = ThreatsList.value.filter(item => item.id !== id);
    }
    const threatsNum = ref(ThreatsList.value.length);
</script>

<template>
    <span class="prompt-text">
        Find {{threatsNum}} possible sensitive information
    </span>
    <div>
        <ThreatItem v-for="item in ThreatsList"
                    :key="item.id"
                    :id="item.id"
                    :threatPriority="item.threatPriority"
                    :attribute="item.attribute"
                    :content="item.content"
                    @remove="removeItem" />
    </div>

</template>