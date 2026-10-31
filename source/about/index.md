---
title: 关于
date: 2026-10-11 13:00:00
---

一台 2015 年的平台，还在服役。够用，也懒得换。

## 这台机器

| 部件 | 配置 |
| --- | --- |
| CPU | Intel Xeon E3-1270 v5 @ 3.60 GHz（4 核 8 线程） |
| 主板 | MSI Z170A XPOWER GAMING TITANIUM EDITION |
| 内存 | 16 GB DDR4-3600（8 GB × 2，双通道） |
| 显卡 | AMD Radeon RX 580 8 GB |
| 系统盘 | 致钛 Ti600 500 GB（NVMe） |
| 数据盘 | 希捷 ST1000DM003 1 TB |
| 系统 | Windows 11 Pro（10.0.26200） |
| 显示 | 1920 × 1080 |

## 主板：一块为超频而生的板子

MSI 在 2015 年 8 月发的 **Z170A XPOWER GAMING TITANIUM EDITION**，是当年微星超频旗舰
XPOWER 系列的钛金版，首发约 $299。在一片黑红配色的年代里，它整块板是**银白 + 黑**的钛金涂装 ——
现在看依然扎眼。

### 供电和用料

- **16 相数字供电**（10+4+2+1），Military Class 5 用料：DrMOS、钛金电感、钽电容
- 4 × DDR4 插槽，最高 64 GB，官方标 DDR4-3600(OC)，双通道能冲过 4000

### 扩展和接口

- **4 × PCIe 3.0 x16**，挂着 Steel Armor 金属护甲，支持 4 路 CrossFire / 2 路 SLI
- 每根 x16 都能用 DIP 开关**单独断电**，排查是哪张卡在捣乱时很省事
- **2 × M.2**（PCIe 3.0 x4 / 32Gb/s，支持 RAID）+ 8 × SATA 6Gb/s + 2 × SATA Express
- 网卡 Intel I219-V 千兆；声卡 Realtek ALC1150 + Audio Boost 3（物理隔离、EMI 屏蔽、Nahimic）
- USB 3.1 Gen2 Type-A / Type-C（ASMedia ASM1142 桥接）
- **BIOS Flashback+**：不装 CPU、内存、显卡也能刷 BIOS
- 板型 ATX，30.5 × 24.4 cm

### 真正体现 XPOWER 的那几件东西

- **OC Dashboard** —— 一块可以外接的小面板，用延长线牵到机箱外面。上面有电源/重启、
  BCLK 加减、DIRECT OC 倍频开关、DISCHARGE、GO2BIOS、SLOW MODE。
  做成分体不是为了好看：**液氮下板上会结霜，按钮冻住就按不动了**，只能搬到手边来按。
- **GAME BOOST** —— 11 档旋钮，转一下就是一把梭自动超频（当年 6700K 能推到约 5 GHz）。
- **V-CHECK POINTS 2** —— 板上留了电压测量端子，万用表夹上去实时读，边超边看。
- **MULTI-BIOS II** —— 两颗 BIOS 芯片加一个切换开关，刷挂了切回来。
- SLOW MODE、OC Engine 2 —— 也都是 LN2 场景下的东西。

一句话：这板子身上一半的零件，是给「把 CPU 冻到零下、用万用表盯着电压往上推」这件事准备的。

## 这块板 + 这颗 U：一个不太正常的组合

正经规格书里，这块板**只支持 6/7 代 Core**，没有任何 Xeon。

而 Xeon E3-1200 v5 被 Intel 特意锁在了服务器芯片组 C232 / C236 上：
媒体当年拿 E3-1230 v5 试过华硕 Maximus VIII Hero、微星 Z170A Gaming M7、映泰 Z170T，
刷到最新 BIOS，**全都点不亮**。

所以官方 BIOS 里其实躺着 E3 v5 的微码，卡住它的是 **Intel ME 固件** ——
不把 ME 换掉或者禁掉，Xeon 就别想起身。

这台机器上：**ME 设备是不存在的**（只有芯片组自带的 A131 温度子系统，没有 ME 接口，也没有 MEI 服务）。
也就是说，这块板上的 **ME 被关掉了** —— 这才是 E3-1270 v5 能站起来的原因。

### ME 是怎么关的

没去下载什么来路不明的"魔改 BIOS"，全过程自己动手：

1. **CH341A 编程器**夹住板上的 SPI 闪存，把原厂 BIOS 读出来 —— 先留一份原厂 dump 兜底
2. **CoffeeTime 0.99** 打开这份 dump，ME 选 **Corporate**，**关掉 ME**，写回闪存
3. **微码不用碰**。官方 BIOS 里本来就躺着 E3 v5 的微码，唯一挡路的是 ME 这一关

自己读、自己改的好处很实在：不依赖任何第三方的二进制，而且原厂 dump 在手 ——
刷废了随时用编程器写回去，这是唯一一种真"刷不砖"的玩法。

只写了改的是**副 BIOS** 那颗，主 BIOS 从头到尾没被写入过 —— 拨杆拨回去，就是一块原厂零售板。

完整过程（工具清单、CoffeeTime 里怎么勾、踩过的坑）写在 {% post_link z170-xeon-e3v5-me-coffeetime 这一篇 %} 里。

（顺带一提，CoffeeTime 本来是为了在 Z170/Z270 上点亮**咖啡湖**才被做出来的工具，
拿它来关 ME 上 Xeon，算是歪打正着。社区里的常见坑是：只关 ME 不换 ME 版本的话，
有些板子第一次开机会反复重启，清一次 CMOS 就好了。）

### 代价

- **BCLK 基本拉不动**，大概到 102.6 MHz 就自动重置 —— 这颗 U 是锁倍频的，超频能力等于白给
- 内存倒是能老实跑在 **3600**（Xeon E3 v5 官方只认 2133），算是这块板的最后一点倔强

2015 年首发 $299 的板子，2026 年在淘宝二手店 **¥228** 收到，到手全功能正常。
插一颗洋垃圾 Xeon，自己用编程器把 Intel 的锁撬开 —— 这件事本身比性能有意思多了。

## 三个盘的分工

- **C:（100 GB）** 只放系统。装完就 60 GB 没了，所以清理是日常。
- **D:（365 GB）** 虚拟机和游戏。Kali、openSUSE、Arch 各占一块，折腾内核和隔离环境都在这里。
- **E:（931 GB）** 工作区。逆向工程、抓包记录、镜像和一堆舍不得删的压缩包。

## 平时在干什么

逆向、二进制、协议分析。静态反汇编和动态调试两条路都走：IDA 看结构，
x64dbg / frida 看运行时，需要隔离就在虚拟机里跑，绝不在主力系统上碰样本。

写点 Python 和 Node 打杂，站里的东西都是 Hexo 静态生成的。

## 这个站

Hexo + 一个自己写的主题，按 Miuix 设计规范做的：色板、圆角、字号都取自规范原值，
字体是 MiSans 子集，图标是内联 SVG —— **不依赖任何外部 CDN**。

写下来的东西大多是自己踩过的坑，留个记录。

## 参考

- [TweakTown：Z170A XPOWER GAMING TITANIUM 评测](https://www.tweaktown.com/reviews/7386/msi-z170a-xpower-gaming-titanium-ed-intel-z170-motherboard-review/index.html)
- [Guru3D：Z170A XPOWER Gaming Titanium 评测](https://www.guru3d.com/review/msi-z170a-xpower-gaming-titanium-review/)
- [PC Perspective：Z170A-XPower Gaming Titanium Edition 评测](https://pcper.com/2015/10/msi-z170a-xpower-gaming-titanium-edition-motherboard-review/)
- [图拉丁吧：不魔改，官方 BIOS 原生支持 E3 v5](https://tieba.baidu.com/p/8758269341)（ME 与 Xeon 启动的关系）
- [gamelsz/xeonlake-1151](https://github.com/gamelsz/xeonlake-1151)（LGA1151 主板跑 Xeon 的完整流程，用的就是 CoffeeTime 0.99）
- [迅维网：CoffeeTime 魔改 BIOS 教程](https://www.chinafix.com/thread-1308015-1-1.html)
- [Win-Raid：Xeon E3 v5 与 ME 的处理](https://winraid.level1techs.com/t/problem-intel-xeon-e3-v5-on-lenovo-m900/99016)
