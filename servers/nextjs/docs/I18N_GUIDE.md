# 国际化 (i18n) 使用指南

本项目已实现轻量级的中英文切换功能。

## 架构说明

### 1. Redux State 管理
- 在 `store/slices/userConfig.ts` 中添加了 `language` 状态
- 支持的语言: `'en'` | `'zh'`
- 语言偏好自动保存到 `localStorage`

### 2. 翻译字典
- 位置: `utils/translations.ts`
- 包含所有翻译键值对的中英文对照
- 使用 TypeScript 类型安全，防止翻译键拼写错误

### 3. 自定义 Hook
- `app/hooks/useTranslation.ts`
- 提供 `t()` 函数用于获取翻译文本
- 返回当前语言设置

### 4. 语言切换组件
- `components/LanguageSelector.tsx`
- 下拉选择器，显示在 Header 右侧
- 切换后立即生效，并保存到本地存储

### 5. 语言初始化
- `app/LanguageInitializer.tsx`
- 应用启动时从 localStorage 恢复用户的语言偏好

## 如何在新组件中使用翻译

### 步骤 1: 添加翻译键
在 `utils/translations.ts` 中添加新的翻译键：

```typescript
export type TranslationKey = 
  // ... 其他键
  | 'myFeature.title'
  | 'myFeature.description';

export const translations = {
  en: {
    // ... 其他翻译
    'myFeature.title': 'My Feature',
    'myFeature.description': 'This is a description',
  },
  zh: {
    // ... 其他翻译
    'myFeature.title': '我的功能',
    'myFeature.description': '这是描述',
  },
};
```

### 步骤 2: 在组件中使用
```typescript
"use client";

import { useTranslation } from '@/app/hooks/useTranslation';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myFeature.title')}</h1>
      <p>{t('myFeature.description')}</p>
    </div>
  );
}
```

## 已翻译的页面/组件

- ✅ Header 导航 (Dashboard, Settings, Create Template, Templates)
- ✅ Settings 页面 (保存配置、下载模型等所有文本)
- ✅ 语言选择器

## 扩展建议

如需翻译更多页面，请按照以下步骤：

1. 在 `utils/translations.ts` 中添加相应的翻译键
2. 在需要翻译的组件中引入 `useTranslation`
3. 使用 `t('translationKey')` 替换硬编码文本
4. 测试中英文切换是否正常

## 注意事项

- 组件必须是 `"use client"` 才能使用 `useTranslation` hook
- 所有翻译键都有 TypeScript 类型检查，避免拼写错误
- 语言偏好会持久化保存在浏览器的 localStorage 中

