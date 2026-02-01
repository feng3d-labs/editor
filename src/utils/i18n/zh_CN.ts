/**
 * 简体中文语言资源
 */
import { LanguageResources } from '../i18n';

export const zh_CN: LanguageResources = {
    // 通用
    common: {
        ok: '确定',
        cancel: '取消',
        yes: '是',
        no: '否',
        close: '关闭',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        remove: '移除',
        search: '搜索',
        reset: '重置',
        confirm: '确认',
        loading: '加载中...',
        error: '错误',
        success: '成功',
        warning: '警告',
        info: '信息',
    },

    // 工具栏
    toolbar: {
        move: '移动 (W)',
        rotate: '旋转 (E)',
        scale: '缩放 (R)',
        pivotCenter: 'Pivot/Center',
        localWorld: 'Local/World',
        play: '播放',
        help: '帮助',
        qrcode: '二维码',
        settings: '设置',
    },

    // 视图
    view: {
        type: 'Type',
        selectToInspect: '选择要检查的内容',
        window: '窗口',
        cameraPreview: '摄像机 预览',
    },

    // 地形
    terrain: {
        brushes: 'Brushes',
        settings: 'Settings',
        brushSize: 'Brush Size',
        opacity: 'Opacity',
    },

    // 消息
    message: {
        gameSceneNotFound: '游戏场景不存在，无法播放',
        cannotOpenRunWindow: '无法打开运行窗口，可能被浏览器阻止了弹窗',
        playFailed: '播放失败',
    },

    // 设置
    settings: {
        appearance: '外观',
        theme: '主题',
        dark: '暗色',
        light: '亮色',
        language: '语言',
        languageZhCN: '简体中文',
        languageEnUS: 'English',
    },

    // 检查器
    inspector: {
        back: '返回',
        backToPrevious: '返回上一个对象',
        noObjectSelected: '未选择对象',
    },

    // 面板标题
    panels: {
        hierarchy: '层级',
        scene: '场景',
        project: '项目',
        inspector: '检查器',
        console: '控制台',
    },

    // 右键菜单
    contextMenu: {
        copy: '复制',
        paste: '粘贴',
        duplicate: '副本',
        delete: '删除',
        remove: '移除',
        removeComponent: '移除组件',
    },

    // 对象属性
    object: {
        name: '名称',
        visible: '可见',
        mouseEnabled: '鼠标启用',
    },

    // 渐变模式
    gradient: {
        color: '颜色',
        gradient: '渐变',
        twoColors: '两个颜色',
        twoGradients: '两个渐变',
        randomColor: '随机颜色',
        unknown: '未知',
    },
};
