<template>
    <nav class="navbar">
        <router-link to="/" class="nav-item">
            <img src="../assets/homepage.svg" class="icon" alt="Home" />
            <span>Threat Overview</span>
        </router-link>
        <router-link to="/settingPage" class="nav-item">
            <img src="../assets/setting.svg" class="icon" alt="Home" />
            <span>Advanced Options</span>
        </router-link>
    </nav>
    <hr class="navBarLine">
</template>

<style scoped>
    .navbar {
        display: flex;
        padding: 0px; /*navbar本身，内部元素如router-link和narbar之间留出空隙*/
        justify-content: space-evenly; /* 让两个 nav-item 对称分布 */
        align-items: center;
        background: white;
        margin-top:-10px;
    }
    .nav-item {
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #EEF7FA;
        padding:5px 10px;
        border-radius:5px;
        font-weight:bold;
        color:black;
        text-decoration:none;
    }

        .nav-item:hover {
            background-color: #CCECF6;
        }

    .icon{
        width:25px;
        height:25px;
    }
    .navBarLine {
        border: none;
        color: #EBEBEB;
        height: 2px;
        margin: 8px 10px;
        border-top: 3px solid;
    }
</style>