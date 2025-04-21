<template>
    <button class="homepageButton" style="background-color: #4CAF50;" @click="sendSignal">Start to detect current email</button>
    <button class="homepageButton" style="background-color: #FF9800;">Encrypt the whole email</button>
    <ThreatsList />
    <v-expansion-panels>
        <v-expansion-panel title="Title"
                           text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima">
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<style scoped>
    .homepageButton {
        align-items: center;
        /*background-color: #4CAF50;*/
        border: none;
        border-radius: 2px;
        color: white;
        padding: 4px 32px;
        font-size: 15px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;

        display: block; 
        width: 94%; 
        /*max-width: 400px;  限制最大宽度 */
        margin: 5px auto; /* 左右自动居中 */
    }
</style>

<script>
    import ThreatsList from "../components/ThreatsList.vue"

    export default {
        methods: {
            sendSignal() {
                chrome.runtime.sendMessage({ action: "detectEmail" }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert("Error is " + chrome.runtime.lastError);
                        return;
                    }
                    alert("Response: " + response);
                });
            }
        }
    }
</script>
