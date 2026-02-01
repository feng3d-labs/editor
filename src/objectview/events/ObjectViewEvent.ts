/**
 * 对象视图事件
 * @deprecated Egret Event 已移除，使用 feng3d EventEmitter 替代
 */
export class ObjectViewEvent
{
	static VALUE_CHANGE = 'valuechange';
	type: string = '';
	space: any;
	attributeName: string;
	attributeValue: string;
}
