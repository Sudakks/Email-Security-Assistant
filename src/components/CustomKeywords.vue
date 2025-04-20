<script setup>
    import AccordionItem from "./AccordionItem.vue"
    import addIcon from '../assets/add.svg'; 
    import { ref, onMounted, watch } from 'vue'

    const keywords = ref([]) //用来存储自定义的keywords
    const newTag = ref('')
    const showInput = ref(false); //用来判断是否打开输入框
    const isAccordionOpen = ref(false);

    //加载本地存储的关键词
    onMounted(() => {
        const storedKeywords = localStorage.getItem('customKeywords');
        if (storedKeywords) {
            keywords.value = JSON.parse(storedKeywords);
        }
    });

    watch(keywords, (newKeywords) => {
        localStorage.setItem('customKeywords', JSON.stringify(newKeywords));
    }, { deep: true });


    //添加标签
    const addTag = () => {
        if (newTag.value.trim()) {
            keywords.value.push(newTag.value.trim());
            newTag.value = '';
            showInput.value = false;
        }
    };

    const removeTag = (index) => {
        keywords.value.splice(index, 1);
    };
</script>

<template>
    <AccordionItem title="Custom Keywords" v-model="isAccordionOpen">
        <template v-if="isAccordionOpen">

            <div class="tag-container">
                <span v-for="(tag, index) in keywords" :key="index" class="tag">
                    {{ tag }}
                    <button class="remove-btn" @click="removeTag(index)">✖</button>
                </span>
            </div>

            <button class="add-keyword" @click="showInput = true">
                <img :src="addIcon" class="icon" alt="Add" />Add new keywords for detection
            </button>



            <div v-if="showInput" class="input-container">
                <textarea v-model="newTag"
                          class="tag-input"
                          placeholder="Please write your own keywords in regex here..."
                          @keyup.enter="addTag" />
                <button @click="addTag" class="confirm-btn">Confirm</button>
            </div>
        </template>
    </AccordionItem>


</template>

<style scoped>
    .icon {
        width: 28px;
        height: 28px;
    }
    .add-keyword {
        background-color: #E4F3F8;
        font-size: 14px;
        font-weight: bold;
        color: #454545;
        border: none;
        border-radius: 5px;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        margin: 5px auto;
        text-align: center;
        padding: 10px 14px;
        gap:5px; 
        cursor:pointer;
    }

        .add-keyword:hover {
            background-color: #D0EEF8;
        }


    .tag-container {
        display: flex;
        flex-wrap: wrap; /* ✅ 自动换行 */
        gap: 5px;
        align-items: center;
        width: 100%;
        /*max-height: 150px;
        overflow-y: auto;  ✅ 超出时滚动 */
        margin:4px 2px;
    }


    .tag {
        background-color: #E4F3F8;
        color: #454545;
        font-size: 14px;
        padding: 5px 10px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        word-break: break-word; /* ✅ 太长的词断开换行 */
    }
        .tag:hover {
            background-color: #D0EEF8;
        }

    .remove-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 14px;
        cursor: pointer;
    }

    .add-btn {
        background-color: #E4F3F8;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    }

    .input-container {
        display: flex;
        align-items: center;
        gap: 9px;
        justify-content: center;
        flex-direction: column;
        margin: 2px auto;
    }

    .tag-input {
        border: 1px solid #ccc;
        padding: 5px;
        border-radius: 5px;
        outline: none;
        width: 80%;
        height: 50px;
        overflow-y: auto; /* 输入太多时出现滚动条 */
        resize: vertical; /* 允许手动上下拉伸 */
        box-sizing: border-box;
        font-size: 14px;
    }

    .confirm-btn {
        background-color: #E4F3F8;
        color: #454545;
        border: none;
        padding: 7px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }
        .confirm-btn:hover {
            background-color: #D0EEF8;
        }
    </style>