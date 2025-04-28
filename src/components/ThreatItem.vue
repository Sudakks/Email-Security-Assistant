<!-- 用来表示单个threat的组件 -->
<script setup>
    import { defineProps, defineEmits } from 'vue'
    import { XCircleIcon, AlertTriangleIcon, InfoIcon, CheckCircleIcon } from "lucide-vue-next"

    import highAlertIcon from '../assets/high-alert.svg'
    import mediumAlertIcon from '../assets/medium-alert.svg'
    import lowAlertIcon from '../assets/low-alert.svg'

    const props = defineProps({
        id: Number,
        threatPriority: String,
        attribute: String,
        content: String
    });

    const emit = defineEmits(["removeItem"]);

    const priorityIcon = {
        high: { icon: highAlertIcon },
        medium: { icon: mediumAlertIcon },
        low: { icon: lowAlertIcon }
    };

    const priority = priorityIcon[props.threatPriority] || priorityIcon.low;
</script>

<template>
    <div class="item-container">
        <div class="left-section">
            <div class="icon-container">
                <img :src="priority.icon" class="icon" alt="Priority Icon" />
                </div>
                <div class="text-content">
                    <p class="attribute">{{attribute}}</p>
                    <p class="content">{{content}}</p>
                </div>
            </div>
            <button @click.stop="emit('remove', id)" class="remove-btn">
                <XCircleIcon class="remove-icon" />
            </button>
        </div>
</template>

<style scoped>
    .item-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 2px solid #EBEBEB;
        border-radius: 5px;
        background-color: white;
        margin: 5px 6px; 
    }
        .item-container:hover {
            background-color: #EBEBEB;
        }

    .left-section {
        display: flex;
        align-items: center;
        gap:9px;
        flex:1;
    }

    .icon-container {
        flex-shrink:0;
    }
    .icon {
        width: 28px;
        height: 28px;
        margin-left: 10px;
    }

    .text-content{
        display:flex;
        flex-direction:column;
        gap:5px;
        flex:1;
        word-break:break-word;
        overflow-wrap:break-word;
    }

    .attribute {
        font-weight: 640;
        font-size: 13px;
        color: #414141;
        margin-bottom:-15px;
    }

    .content {
        color: #5D5D5D;
        font-size: 13px;
        font-weight: 600;
    }

    .remove-btn {
        background: none;
        border: none;
        padding-right: 5px;
        cursor: pointer;
        color: #cbd5e0;
        transition: color 0.2s;
    }

        .remove-btn:hover {
            color: #5D5D5D;
        }

    .remove-icon {
        width: 35px;
        height: 35px;
    }
</style>