<script setup>
    import CustomKeywords from "../components/CustomKeywords.vue"
    import EncryptionSettings from "../components/EncryptionSettings.vue"
    </script>

<template>
    <div class="accordion">
        <CustomKeywords />
        <EncryptionSettings />
        </div>
</template>

<style scoped>
    .accordion {
        width: 300px;
        margin: 10px;
    }
    </style>