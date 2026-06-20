<template>
  <span class="codicon" :class="`codicon-${icon}`"></span>
</template>

<script setup lang="ts">
type Props = {
  icon: string;
};

defineProps<Props>();
</script>
