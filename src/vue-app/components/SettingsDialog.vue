<template>
  <el-dialog
    v-model="visible"
    :title="t('toolbar.settings')"
    width="500px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="settings-content">
      <!-- 主题设置 -->
      <div class="settings-section">
        <h3 class="settings-section-title">{{ t('settings.appearance') }}</h3>
        <div class="settings-item">
          <label class="settings-label">{{ t('settings.theme') }}</label>
          <el-radio-group
            :model-value="currentTheme"
            @update:model-value="onThemeChange"
            class="settings-radio-group"
          >
            <el-radio-button value="dark">
              <Icon icon="mdi:weather-night" :size="16" style="margin-right: 4px;" />
              {{ t('settings.dark') }}
            </el-radio-button>
            <el-radio-button value="light">
              <Icon icon="mdi:weather-sunny" :size="16" style="margin-right: 4px;" />
              {{ t('settings.light') }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 语言设置 -->
      <div class="settings-section">
        <h3 class="settings-section-title">{{ t('settings.language') }}</h3>
        <div class="settings-item">
          <label class="settings-label">{{ t('settings.language') }}</label>
          <el-select
            :model-value="currentLanguage"
            @update:model-value="onLanguageChange"
            class="settings-select"
          >
            <el-option
              :label="t('settings.languageZhCN')"
              value="zh_CN"
            />
            <el-option
              :label="t('settings.languageEnUS')"
              value="en_US"
            />
          </el-select>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">{{ t('common.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore, type ThemeType } from '../stores/themeStore';
import { useI18n, type Language } from '../composables/useI18n';
import Icon from './Icon.vue';

const props = withDefaults(defineProps<{
  modelValue?: boolean;
}>(), {
  modelValue: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const themeStore = useThemeStore();
const { t, language, setLanguage } = useI18n();

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 当前主题
const currentTheme = computed(() => themeStore.currentTheme);

// 当前语言
const currentLanguage = computed(() => language.value);

// 主题变化处理
function onThemeChange(theme: ThemeType) {
  themeStore.setTheme(theme);
}

// 语言变化处理
function onLanguageChange(lang: Language) {
  setLanguage(lang);
}

// 关闭对话框
function onClose() {
  visible.value = false;
}
</script>

<style scoped>
.settings-content {
  padding: 8px 0;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.settings-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
  margin-right: 16px;
}

.settings-radio-group {
  flex: 1;
  display: flex;
  gap: 8px;
}

.settings-radio-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}

.settings-select {
  flex: 1;
  max-width: 200px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
