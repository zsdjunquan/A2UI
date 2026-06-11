<script setup lang="ts">
import { ElButton } from "element-plus";
import type { SubmitBarProps } from "./types";

withDefaults(defineProps<SubmitBarProps>(), {
  submitText: "提交",
  skipText: "跳过",
  showSkip: false,
});

const emit = defineEmits<{
  submit: [];
  skip: [];
}>();
</script>

<template>
  <div class="submit-bar">
    <p v-if="defaultHint" class="submit-bar__hint">{{ defaultHint }}</p>
    <div class="submit-bar__actions">
      <ElButton v-if="showSkip" :disabled="loading" @click="emit('skip')">
        {{ skipText }}
      </ElButton>
      <ElButton type="primary" :loading="loading" :disabled="disabled" @click="emit('submit')">
        {{ loading && loadingText ? loadingText : submitText }}
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.submit-bar {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.submit-bar__hint {
  min-width: 0;
  margin: 0;
  color: var(--muted, #93a3b5);
  font-size: 12px;
  line-height: 1.5;
}

.submit-bar__actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 760px) {
  .submit-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .submit-bar__actions {
    justify-content: flex-end;
  }
}
</style>
