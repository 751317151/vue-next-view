<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { onMounted } from "vue";

const userStore = useUserStore();

onMounted(() => {
  userStore.init();
});
</script>

<template>
  <router-view></router-view>
</template>

