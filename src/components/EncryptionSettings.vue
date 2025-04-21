<script setup>
    import AccordionItem from "./AccordionItem.vue"
    import DropdownSelector from './DropdownSelector.vue'
    import { ref, onMounted, watch } from 'vue'

    const selectedAlgorithm = ref('');
    const encryptionOptions = [
        { label: 'PGP (Pretty Good Privacy)', value: 'PGP' },
        { label: 'S/MIME', value: 'S/MIME' },
        { label: 'TLS', value: 'TLS' }
    ]
    const isAccordionOpen = ref(false);

    onMounted(() => {
        const encryptionAlgorithm = localStorage.getItem('encryptionAlgorithm');
        if (encryptionAlgorithm) {
            selectedAlgorithm.value = JSON.parse(encryptionAlgorithm);
        }
    });

    watch(selectedAlgorithm, (newEncryptionAlgorithm) => {
        localStorage.setItem('encryptionAlgorithm', JSON.stringify(newEncryptionAlgorithm));
    }, { deep: true });
</script>

<template>
    <AccordionItem title="Encryption Settings" v-model="isAccordionOpen">
        <label class="label">Current encrption selection:</label>
        <DropdownSelector v-model="selectedAlgorithm"
                          :options="encryptionOptions" />
    </AccordionItem>
</template>

<style>
    .label {
        display: block;
        margin-bottom: 7px;
        font-weight: bold;
        color: #444;
    }
    </style>