<template>
  <header class="page-header">
    <h1 class="page-header__title">{{ title }}</h1>
    <div class="page-header__actions">
      <BaseButton
        class="page-header__action-button"
        @click="$emit('generate-program')"
      >
        Generate Program
      </BaseButton>
      <BaseButton
        class="page-header__action-button"
        @click="$emit('toggle-race')"
      >
        Start/Pause
      </BaseButton>
    </div>
  </header>
</template>

<script>
import BaseButton from "./base/BaseButton.vue";

export default {
  name: "PageHeader",
  components: {
    BaseButton,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: tomato;
  padding: 16px;
}

.page-header__title {
  font-size: 24px;
  margin: 0;
}

.page-header__actions {
  display: flex;
  gap: 8px;
}

.page-header__action-button {
  text-transform: uppercase;
}
</style>
