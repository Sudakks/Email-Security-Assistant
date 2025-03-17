<!--用来实际配置-，负责定义应用的基本结构和组织其他组件-->
<template>
    <div>
        <Title />  
    </div>
    <Navbar />
    <router-view></router-view>
</template>

<script setup>
    import Navbar from "./components/Navbar.vue"
    import Title from "./components/Title.vue"
</script>

