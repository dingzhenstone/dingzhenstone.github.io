---
title: 用自建 CoreCLR 绕 DNGuard HVM：换一个运行时，而不是改它的运行时
date: 2026-10-11 12:45:00
tags: [逆向, .NET, DNGuard, CoreCLR, 反混淆]
categories: [逆向工程]
---

## 背景

在一次**已获授权**的逆向分析里，托管层的方法被 DNGuard 4.9.6 保护。它的三层防护组合拳相当完整：

- **字符串层**：DNGuard 加密串表（运行时自己吐明文，几秒可破）；
- **方法层**：`~85%` 的方法被替换成 stub，真逻辑在自研 VM 里；
- **防篡改层**：三重校验 —— ① JIT vtable[0] 指针值 ② `compileMethod` 前导字节 ③ 间接跳转目标（CFG）。

结果就是：**JIT hook 一碰就 failfast**（`__fastfail` 甚至接不到 VEH）。

## 试过的死路

| 思路 | 结果 |
|---|---|
| JIT hook（直接 / frida） | ❌ DNGuard 三重校验 → failfast |
| `de4dot` | ❌ 只识别 `ZYXDNGuarder` 类型名，不做处理 |
| 现成 DNGuard 脱壳器（demo） | ❌ 试用版把 HVM 字段置零 + 版本认错 |
| 静态反 `Runtime64.dll` 的 `.hvm0` | ❌ 熵 7.3，Hex-Rays 连函数都反不出 |
| 内置 `DOTNET_JitDump` | ❌ release 版 .NET 已关闭该功能 |
| 运行时抓 MSIL | ❌ 时机太短 / 部分方法根本不以 IL 存在 |

## 关键转变：换运行时 ≠ 改运行时

DNGuard 的防篡改，本质都是**检测"它的运行时有没有被人动过手脚"**：

```
① 校验 JIT vtable[0] 指针值
② 校验 compileMethod 前导字节
③ 校验间接跳转目标 (CFG)
```

那么——**如果我们不改它的运行时，而是换一个自己编译的 CoreCLR 呢？**

在自己编的 CLR 里，这些值是**我们说了算的**：没被 hook、字节原装、跳转正常。
DNGuard 的校验**全部通过**，因为它防守的对象根本不存在了。

**IL 会在 JIT 时流经我们自己的代码 —— 顺手 dump。**

> 一句话：它防的是"别人改它的运行时"；我们"换一个运行时"，它就没有防守面。

## 补丁

落点：`src/coreclr/vm/jitinterface.cpp` → `CEEJitInfo::compileMethod`

````cpp
CORINFO_METHOD_INFO* methodInfo = comp->getMethodInfoInternal();

// ==== masslab IL DUMP PATCH (非 hook: CLR 自身流程内联) ====
if (methodInfo != NULL && methodInfo->ILCode != NULL && methodInfo->ILCodeSize > 0)
{
    EX_TRY {
        MethodDesc* pMD = GetMethod(comp->getMethodHandle());
        if (pMD != NULL) {
            CreateDirectoryA("C:\\ildump", NULL);
            char path[MAX_PATH];
            sprintf_s(path, MAX_PATH, "C:\\ildump\\%08X.il", (unsigned)pMD->GetMemberDef());
            FILE* fp = fopen(path, "wb");
            if (fp != NULL) { fwrite(methodInfo->ILCode, 1, methodInfo->ILCodeSize, fp); fclose(fp); }
        }
    }
    EX_CATCH { } EX_END_CATCH(SwallowAllExceptions);
}
// ==== end patch ====
````

要点：**不是 hook**，是 CLR 自身流程内联；用 `EX_TRY/EX_CATCH` 包住，绝不影响主流程。

## 构建与运行

```bat
:: VS Build Tools 2022: 【使用 C++ 的桌面开发】+ Windows SDK + CMake
cd <dotnet-runtime>\src\coreclr
build-runtime.cmd -c Release -s clr
```

取产物 `coreclr.dll` / `clrjit.dll`，放进**隔离 VM**（断网、不装第三方反作弊、装 .NET 8.0.x）替换，然后加载目标程序集，收 `C:\ildump\`。

## 能不能成，取决于一件

补丁抓到的是「**CLR 递给 JIT 的 IL**」：

| 保护形态 | 拿到 | 后续 |
|---|---|---|
| **密文 → 运行时解密 → 交 JIT** | ✅ 明文 IL | 直接反编译 |
| **纯自研 DVM 字节码解释** | ❌ 只有 stub | 需另 hook DVM 入口 |

不跑不知道是哪种——这正是这个实验的意义。

## 边界

- 仅用于**已获授权**的逆向分析，隔离环境；
- 不针对真实线上服务 / 反作弊；
- 不包含对任何第三方商业软件**授权控制**的绕过（不碰其它工具的 trial/license 逻辑）。

---

*代码：`DNGuardKiller`（本地仓库）。*
