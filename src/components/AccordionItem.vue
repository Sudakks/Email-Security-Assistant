<!-- 共同的折叠栏组件 Advanced Option页面 -->
<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        title: String,
        modelValue: Boolean //用于接收父组件传递的v-model，即是否折叠
    });
    const emit = defineEmits(['update: modelValue']);//通知父组件切换状态

    const togglePanel = () => {
        emit('update:modelValue', !props.modelValue);
    }
</script>

<template>
        <div class="accordion-item">
            <div class="accordion-header" @click="togglePanel">
                <span :class="{'rotated': modelValue}">▶</span>{{title}}
            </div>
            <div class="accordion-content" v-if="modelValue">
                <slot></slot>
                <!--占位符，它允许父组件在子组件（即 accordion 组件）中插入内容，预留了一个位置-->
            </div>
        </div>
</template>

<style scoped>

    .accordion-item {
        padding: 5px 0;
    }

    .accordion-header {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        color: #454545;
    }

        .accordion-header span {
            margin-right: 8px;
            transition: transform 0.2s ease-in-out;
        }

    .rotated {
        transform: rotate(90deg);
    }

    .accordion-content {
        color: #454545;
        font-size: 13px;
        justify-content: center;
        display: block;
        padding: 10px 0; 
    }
    
</style>
