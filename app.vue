<template>
  <Transition name="fade" mode="out-in">
    <div
      :class="{
        'card-wrapper': true,
        max: route.path === '/',
      }"
      key="card-wrapper"
    >
      <button
        class="button button-outline card" 
        @click="navigateTo('/')"
        style="width: 10cap"
        v-if="route.path !== '/'"
      >
        назад
      </button>
      <button
        class="button button-outline card"
        @click="navigateTo('/create/test')"
        
      >
        Создать тест
      </button>
      <button class="button button-outline card">Список тестов</button>
      <button class="button button-outline card">Статистика</button>
      <button class="button button-outline card">Группы</button>
    </div>
  </Transition>

  <NuxtPage></NuxtPage>
</template>

<script setup>
const route = useRoute();
</script>

<style>
.card-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  transition: all 0.5s ease;
}

.max {
  height: 30cap;
}

.card {
  width: 30cap;
  transition: height 0.3s ease, width 0.3s ease;
}

.button {
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.button:hover {
  transform: scale(1.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
