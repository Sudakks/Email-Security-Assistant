<template>
    <div class="container">
        <select v-model="selected" class="dropdown">
            <option disabled value="">Select an option</option>
            <option v-for="(option, index) in options" :key="index" :value="option.value"> {{option.label}}</option>
                
            </select>
        </div>
    </template>

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        options: {
            type: Array,
            required: true,
            default:()=>[]
        },
        modelValue: {
            type: String,
            default:''
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const selected = computed({
        get: () => props.modelValue,
        set:(val)=>emit('update:modelValue', val)
    })
    </script>

<style scoped>
    .container {
        font-family: sans-serif;
        margin: 5px;
        max-width: 300px;
    }


    .dropdown {
        width: 100%;
        padding: 8px;
        font-size: 14px;
        border-radius: 6px;
        border: 2px solid #ccc;
        background-color: white;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23666' d='M2 0L0 2h4L2 0zM2 5L0 3h4l-2 2z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 10px;
    }
</style>