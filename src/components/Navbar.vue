<template>
    <nav>
        <router-link to="/">Page1</router-link> |
        <router-link to="/settingPage">Page2</router-link>
    </nav>
</template>

<style scoped>
    nav {
        background: #3498db;
        padding: 10px;
    }

    a {
        color: white;
        text-decoration: none;
        margin: 0 10px;
    }
</style>