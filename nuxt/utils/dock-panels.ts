/**
 * 停靠区面板协调：星愿瓶、摘抄本和团子气泡都在屏幕底部，各自展开时
 * 很容易叠在一起。与其在每个组件里互相 import，不如用一条窗口事件
 * 声明"我要展开了"，其它面板收到后自己收起。
 *
 * 新加底部挂件时，只要接入这套约定，就不会再出现两个面板互相遮挡。
 */
export type DockPanelName = 'star-jar' | 'excerpt-shelf' | 'companion';

export const DOCK_PANEL_EVENT = 'bs-dock-panel';

/** 某个面板展开时广播自己；同名的重复广播应被忽略。 */
export const announceDockPanel = (panel: DockPanelName) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<DockPanelName>(DOCK_PANEL_EVENT, { detail: panel }));
};
