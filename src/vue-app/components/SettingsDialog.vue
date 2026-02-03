<template>
  <el-dialog
    v-model="visible"
    :title="t('toolbar.settings')"
    width="600px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="settings-content">
      <!-- 主题设置 -->
      <div class="settings-section">
        <h3 class="settings-section-title">{{ t('settings.appearance') }}</h3>
        
        <!-- 新主题选择 -->
        <div class="settings-item">
          <label class="settings-label">{{ t('settings.theme') }}</label>
          <el-select
            :model-value="selectedThemeId"
            @update:model-value="onThemeChange"
            class="settings-select-full"
            placeholder="Select a theme"
          >
            <el-option
              v-for="theme in availableThemes"
              :key="theme.id"
              :label="theme.name"
              :value="theme.id"
            />
          </el-select>
        </div>
        
        <!-- 传统主题选择（保留原有功能） -->
        <div class="settings-item">
          <label class="settings-label">{{ t('settings.classicTheme') }}</label>
          <el-radio-group
            :model-value="classicTheme"
            @update:model-value="onClassicThemeChange"
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
import { computed, onMounted, ref } from 'vue';
import { useThemeStore, type ThemeType } from '../stores/themeStore';
import { useI18n, type Language } from '../composables/useI18n';
import Icon from './Icon.vue';
import { ThemeService, type ThemeInfo } from '../services/ThemeService';

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

// 主题服务
const themeService = ThemeService.getInstance();

// 可用主题列表
const availableThemes = ref<ThemeInfo[]>([]);

// 当前选中的主题ID
const selectedThemeId = ref<string>('');

// 经典主题（保留原有功能）
const classicTheme = computed({
  get: () => themeStore.currentTheme,
  set: (value: ThemeType) => {
    themeStore.setTheme(value);
  }
});

// 在组件挂载时加载主题信息
onMounted(() => {
  availableThemes.value = themeService.getThemes();
  
  // 设置当前主题ID
  const currentThemeId = themeService.getCurrentThemeId();
  if (currentThemeId) {
    selectedThemeId.value = currentThemeId;
  } else {
    // 如果没有加载过特定主题，则根据当前经典主题设置默认值
    selectedThemeId.value = currentTheme.value === 'dark' ? 'dark_modern' : 'light_modern';
  }
});

// 主题变化处理（新的主题系统）
async function onThemeChange(themeId: string) {
  try {
    await themeService.loadAndApplyTheme(themeId);
    selectedThemeId.value = themeId;
    
    // 保存主题ID到本地存储
    localStorage.setItem('editor-vscode-theme', themeId);
  } catch (error) {
    console.error('Failed to apply theme:', error);
  }
}

// 经典主题变化处理（保留原有功能）
function onClassicThemeChange(theme: ThemeType) {
  themeStore.setTheme(theme);
  
  // 重置所选主题ID，因为现在使用经典主题
  selectedThemeId.value = '';
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

.settings-item:not(:last-child) {
  margin-bottom: 8px;
}

.settings-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
  margin-right: 16px;
  min-width: 120px;
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

.settings-select-full {
  flex: 1;
  max-width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
