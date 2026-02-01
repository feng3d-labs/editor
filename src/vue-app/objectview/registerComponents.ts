import { objectview } from 'feng3d';
import { createOAVComponent } from './utils/createOAVComponent';
import { createOBVComponent } from './utils/createOBVComponent';
import { createOVComponent } from './utils/createOVComponent';

// 导入 OV 组件
import OVDefaultVue from './ov/OVDefault.vue';

// 导入 OBV 组件
import OBVDefaultVue from './obv/OBVDefault.vue';

// 导入 OAV 组件
import OAVDefaultVue from './oav/OAVDefault.vue';
import OAVBooleanVue from './oav/OAVBoolean.vue';
import OAVNumberVue from './oav/OAVNumber.vue';

/**
 * 注册所有 Vue 版本的 objectview 组件
 */
export function registerObjectViewComponents()
{
    // ============ 对象视图组件 ============

    /** 默认对象视图 - 渲染整个对象的所有属性块 */
    createOVComponent('OVDefault', OVDefaultVue);

    // ============ 块视图组件 ============

    /** 默认块视图 - 渲染一组属性（可折叠） */
    createOBVComponent('OBVDefault', OBVDefaultVue);

    // ============ 属性视图组件 ============

    /** 默认属性视图 - 文本输入 */
    createOAVComponent('OAVDefault', OAVDefaultVue);

    /** 布尔值属性视图 - 开关 */
    createOAVComponent('OAVBoolean', OAVBooleanVue);

    /** 数字属性视图 - 数字输入 */
    createOAVComponent('OAVNumber', OAVNumberVue, (info) => ({
        name: info.name,
        owner: info.owner,
        editable: info.editable,
        attributeViewInfo: info,
        step: info.componentParam?.step || 0.001,
        stepDownup: info.componentParam?.stepDownup || 0.001,
        minValue: info.componentParam?.minValue,
        maxValue: info.componentParam?.maxValue,
    }));

    // ============ 配置默认视图组件 ============

    // 注意：这些配置可能会覆盖现有的配置，需要谨慎处理
    // 如果已有配置，可以选择不设置或合并配置
    if (!objectview.defaultBaseObjectViewClass) {
        objectview.defaultBaseObjectViewClass = 'OVDefault';
    }
    if (!objectview.defaultObjectViewClass) {
        objectview.defaultObjectViewClass = 'OVDefault';
    }
    if (!objectview.defaultObjectAttributeViewClass) {
        objectview.defaultObjectAttributeViewClass = 'OAVDefault';
    }
    if (!objectview.defaultObjectAttributeBlockView) {
        objectview.defaultObjectAttributeBlockView = 'OBVDefault';
    }

    // 配置默认类型属性视图（如果尚未配置）
    if (!objectview.defaultTypeAttributeView['Boolean']) {
        objectview.setDefaultTypeAttributeView('Boolean', { component: 'OAVBoolean' });
    }
    if (!objectview.defaultTypeAttributeView['number']) {
        objectview.setDefaultTypeAttributeView('number', { component: 'OAVNumber' });
    }
}
