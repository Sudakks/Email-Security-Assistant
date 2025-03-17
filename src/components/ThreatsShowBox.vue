<script setup>
    import { ref } from 'vue'
    const threatsNum = ref(5)
    const threatsItem = ref([
        { id: 1, threatPriority: "high", attribute: "ID Number Detected", content: "389568xxxx93858" },
        { id: 2, threatPriority: "medium", attribute: "Email Address Detected", content: "123456@gmail.com" },
        { id: 3, threatPriority: "low", attribute: "Sensitive Keyword: confidential", content: "This document is confidential..." }
    ]);

</script>

<template>
    <span class="prompt-text">
        Find {{threatsNum}} possible sensitive information
    </span>
</template>

<style scoped>
</style>