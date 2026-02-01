<script setup lang="ts">
import { useOBVDefault, type OBVDefaultProps } from './useOBVDefault';
import ObjectAttributeView from '../ObjectAttributeView.vue';
import Icon from '../../components/Icon.vue';

const props = defineProps<OBVDefaultProps>();
const { isExpanded, toggleExpanded, showTitle } = useOBVDefault(props);
</script>

<template>
    <div class="obv-default">
        <div v-if="showTitle" class="obv-header" @click="toggleExpanded">
            <Icon
                icon="mdi:chevron-right"
                :size="16"
                class="obv-icon"
                :class="{ 'obv-icon-expanded': isExpanded }"
            />
            <span class="obv-title">{{ props.name }}</span>
        </div>
        <div v-show="isExpanded || !showTitle" class="obv-content">
            <ObjectAttributeView
                v-for="(attrInfo, index) in props.itemList"
                :key="index"
                :attrInfo="attrInfo"
            />
        </div>
    </div>
</template>

<style scoped>
.obv-default {
    border: 1px solid var(--el-border-color, #3d3d3d);
    border-radius: 2px;
    margin-bottom: 4px;
    background-color: var(--el-bg-color-overlay, #2d2d2d);
}

.obv-header {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    cursor: pointer;
    user-select: none;
    background-color: var(--el-fill-color, #2d2d2d);
}

.obv-header:hover {
    background-color: var(--el-fill-color-dark, #3d3d3d);
}

.obv-icon {
    margin-right: 4px;
    transition: transform 0.2s;
    font-size: 12px;
    color: var(--el-text-color-primary, #cccccc);
}

.obv-icon-expanded {
    transform: rotate(90deg);
}

.obv-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-primary, #cccccc);
}

.obv-content {
    padding: 4px 0;
}
</style>
