<script setup lang="ts">
import { useOAVNumber, type OAVNumberProps } from './useOAVNumber';

const props = defineProps<OAVNumberProps>();
const { label, value, onChange, onKeyDown } = useOAVNumber(props);
</script>

<template>
    <div class="oav-row">
        <label class="oav-label" :title="props.name">{{ label }}</label>
        <div class="oav-value">
            <el-input-number
                :model-value="value"
                :disabled="!props.editable"
                :step="step"
                :min="minValue"
                :max="maxValue"
                :precision="precision"
                size="small"
                @update:model-value="onChange"
                @keydown="onKeyDown"
            />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'OAVNumber',
    props: {
        step: { type: Number, default: 0.001 },
        stepDownup: { type: Number, default: 0.001 },
        minValue: { type: Number, default: undefined },
        maxValue: { type: Number, default: undefined },
    },
};
</script>

<style scoped>
.oav-row {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    min-height: 24px;
}

.oav-label {
    flex: 0 0 120px;
    font-size: 12px;
    color: var(--el-text-color-primary, #cccccc);
    user-select: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.oav-value {
    flex: 1;
    min-width: 0;
}
</style>
