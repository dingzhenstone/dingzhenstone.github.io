# j3rk

自建的 Hexo 主题，实现 **Miuix 设计规范**（小米 HyperOS 那套观感）。

设计标准来源：**[compose-miuix-ui/miuix](https://github.com/compose-miuix-ui/miuix)**（Apache-2.0），
取的是这几个文件里的实际数值，不是照着截图猜的：

| 取的是 | 出处 |
| --- | --- |
| 全部颜色（浅/深） | `docs/zh_CN/guide/colors.md` ← `theme/Colors.kt` |
| 字号 / 字重 | `theme/TextStyles.kt` |
| 页面底色、卡片色 | `basic/Scaffold.kt:89`、`basic/Card.kt:185` |
| 卡片 / 按钮 / 图标按钮圆角、尺寸 | `basic/{Card,Button,IconButton}.kt` 的 `*Defaults` |
| 顶栏折叠高度、标题边距、大小标题字号 | `basic/TopAppBar.kt:732,763` + `TopAppBarDefaults` |
| 分隔线 0.75dp | `basic/Divider.kt` |
| 超椭圆控制点 0.643 | `miuix-squircle/SquirclePath.kt` |
| 毛玻璃半径 25 | `miuix-blur` 的示例取值 |
| 按钮默认配色 (灰) | `basic/Button.kt` 的 `ButtonDefaults.buttonColors` |

整个主题 **零外部 CDN 依赖**：字体是 MiSans 子集，图标是内联 SVG，断网也能完整渲染。

规范仓库已克隆留档：`E:\workspace\miuix-spec`（28M，含 `docs/zh_CN/guide/` 全部指南）。

## 关键令牌

```
颜色 (浅 / 深)
  primary            #3482FF / #277AF7      页面/链接/选中
  tertiaryContainer  #EAF2FF / #2B3B54      引用块、标签  (文字 #3482FF / #4788FF)
  surface            #F7F7F7 / #000000      页面底色 (Scaffold containerColor)
  surfaceContainer   #FFFFFF / #242424      卡片底色   ← 浅色白卡+浅灰底 / 深色深灰卡+纯黑底
  secondaryVariant   #F0F0F0 / #434343      按钮默认底色 (onSecondaryVariant 文字)
  onBackgroundVariant #8C93B0 / #787E96     次级文本 (那个标志性蓝灰)
  onSurfaceSummary   rgba(0,0,0,.6) / rgba(255,255,255,.5)   摘要/副标题
  divider            #E0E0E0 / #393939

尺寸
  卡片圆角 16 · 按钮圆角 16 / 高 ≥40 / 内边距 16×13 · 图标按钮 40×40 正圆
  顶栏: 折叠条 52 · 内条 50 · 标题边距 26 · 图标边距 16 · 大标题 32 Normal → 折叠标题 20 Medium
  字号: title1 32 · title2 24 · title3 20 · title4 18 · main 17 · body1 16 · body2 14 · footnote1 13 · footnote2 11
        (title1-4 全部 Normal 字重, 规范里只有 subtitle 是 Bold; 折叠条里的标题是规范特例 20 Medium)
```

改配色只要改 `_config.yml` 的 `monet: true` + `seed_color`，走 Miuix 的 Monet 模式动态取色。

## 与规范的偏差（都是有意的）

1. **正文行高 1.7**，规范里 `Paragraph` 是 1.2em。那是给手机 UI 短句的，中长文按 1.2 会挤成一坨。
2. **顶栏在宽屏下对齐到内容列**。规范是手机（全宽 + 26dp 边距），桌面 1280px 下标题会孤零零贴在屏幕最左边，所以 `--ab-side` 取了 `max(26px, 居中留白)`。
3. **超椭圆用 CSS `corner-shape: superellipse(4)`**，规范是 `SquirclePath`（控制点 0.643）画的路径。不支持的浏览器自动退回普通圆角，不会坏。
4. **毛玻璃**用 `backdrop-filter: blur(25px)`，和 Compose 的 Backdrop 不等价，只是取同一个半径。
5. **Monet 的角色映射是近似的** —— Miuix 的色名（`primaryVariant`/`tertiaryContainer`…）和 MD3 的角色不是一一对应。

## 目录

```
themes/j3rk/
├── _config.yml          theme_mode(system|light|dark) / monet / seed_color / menu / footer
├── layout/
│   ├── layout.ejs       顶栏(大标题+折叠条) + 预绘制明暗解析 + 回顶 FAB
│   ├── index.ejs        首页卡片流
│   ├── post.ejs         文章 (meta / 标签 / 上下篇)
│   ├── page.ejs         独立页面
│   └── archive.ejs      归档 (Miuix 列表: 白底块 + 内缩分隔线)
└── source/
    ├── css/miuix.css    全部令牌 + 组件样式
    ├── css/misans.css   @font-face
    ├── js/j3rk.js       顶栏折叠 / 明暗切换 / 回顶 / Monet(按需加载)
    ├── js/md3.bundle.js Monet 取色算法 (默认不加载)
    └── fonts/*.woff2    MiSans 子集
```

## 构建

```bash
# 1) Monet 取色算法打包 (改了 color-utilities 版本才需要重跑)
npx esbuild monet-entry.js --bundle --format=esm --minify --target=es2020 \
  --outfile=themes/j3rk/source/js/md3.bundle.js

# 2) 字体子集 (改了文章/模板, 加了新字以后重跑)
python gen_subset.py                       # 收集站点用到的全部字符
pyftsubset /e/workspace/miui_theme/fonts/MiSans-Regular.woff2 \
  --text-file=_subset_chars.txt --flavor=woff2 --layout-features='*' \
  --output-file=themes/j3rk/source/fonts/misans-regular.woff2
# Bold 同理

# 3) 生成
npx hexo clean && npx hexo generate
```

## 坑（改这个主题前先读）

1. **`document.currentScript` 在 `type="module"` 里恒为 `null`**。配置只能从 `<html>` 的 `data-*` 读。
2. **`hexo server` 持有启动时的内存配置**，还在监听 source。改主题配置后它会用旧配置重新生成
   `public/`，覆盖掉你手动 `hexo generate` 的结果。要验证配置改动：**先停 server**，再静态托管 `public/`。
3. **配置里不存在的字段会静默变 `undefined`**，不报错。历史上踩过一次：色板算成 `#000000`，表现是"卡片黑底黑字"。
4. 顶栏折叠靠 `position: sticky; top: calc(-1 * var(--ab-large-h))` —— 大标题区的高度由 JS 量出来回填，
   量错就会整条顶栏移出视口（表现：滚动后页面上方一片空白）。
