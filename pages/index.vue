<template>
  <div ref="element"></div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';

// Function to render math expressions


const element = ref(null);
const inputText = "Here is a math expression: $c = \\pm\\sqrt{a^2 + b^2}$ and another one: $E=mc^2$";

nextTick(() => {
  if (element.value) {
    element.value.innerHTML = renderMath(inputText);
  }
});
</script>

<style>
/* Add any necessary styles here */
</style>