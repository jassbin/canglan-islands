# Third-party notice · 第三方告知

## English

This repository is mostly our own code. These parts are not, and their terms travel with them.

### Vendored code — three.js

| File | What it is |
|---|---|
| `lib/three.module.js` | three.js, revision **160**, ES-module build, vendored unmodified |
| `lib/jsm/loaders/GLTFLoader.js` | three.js example module |
| `lib/jsm/utils/BufferGeometryUtils.js` | three.js example module |

Copyright 2010-2023 Three.js Authors. Distributed under the **MIT licence**
(`SPDX-License-Identifier: MIT`). The licence header is retained inside each vendored file.
The pages import these local copies; nothing is fetched from a CDN at run time.

The whole scene is built from three.js primitives at load time. No third-party 3D model file
(glb / gltf / obj / fbx) is shipped, and the loader above is present only for format
compatibility, not because the repo depends on external assets.

### Open graticule data under the map

| Layer | Source | Notes |
|---|---|---|
| `assets/region.jpg`, `assets/relief.png`, `assets/ext_depth.bin` | **GEBCO Chart** (international bathymetric compilation) | Resampled and recoloured into a tactical depth map. © GEBCO, NIO, on behalf of the Intergovernmental Oceanographic Commission of UNESCO. The GEBCO Grid may be used and redistributed free of charge under the terms of its user guide; keep this notice if you redistribute. |
| Block terrain and island height fields | Global elevation derived from **SRTM** (NASA / USGS), served as open **terrain tiles** in terrarium encoding | SRTM is a United States government work and carries no copyright; the tile service is offered as open data by its host. |
| Land colour everywhere, including the close-in island blocks (`assets/islands/*.bin`) | **Computed in this repository** from the elevation grid above | Elevation-driven hypsometric tinting — the same elevation→colour table used for `assets/relief.png`, applied to the island height fields and hill-shaded from the same grid. No satellite or aerial imagery is sampled anywhere in the shipped map, so there is no third-party raster to attribute or to remove before redistribution. (`assets/coast.bin` is a 0 m isoline as float32 segments — geometry only, no colour.) |

### Optional cloud persistence — shipped disabled

`js/wgcloud.js` is a persistence adapter kept as a **template**. Its endpoint, tenant,
key and SDK address are placeholders (`<PUBLISHABLE_KEY>`, `<CLOUD_SDK_URL>`, …), and the
module only activates when `location.hostname` matches the endpoint you configure — which
no public checkout can satisfy. Out of the box it loads nothing, contacts nothing, and
falls back to browser-local storage. Wire in your own storage backend if you want shared
run history.

### Publications and links

The method pages cite scholarly and official publications (salvo-model literature,
decision-process practice, service journals) by URL. Those works belong to their authors and
publishers; only links and short factual attributions appear here, never copies.

### Names

Real equipment, unit and place names appear because they are the words the public sources
use. That is description, not endorsement, and implies no affiliation with, or endorsement by,
any organisation.

### Nothing else is loaded

Measured over the shipped pages: no web fonts, no remote scripts, no remote images, no
analytics. The only outbound requests a visitor's browser makes are the citation links a
visitor clicks on purpose.

---

## 中文

本仓库的主体是我们自己的代码。下面这些不是，它们的条款跟着文件一起走。

### 随仓库附带的代码 —— three.js

| 文件 | 是什么 |
|---|---|
| `lib/three.module.js` | three.js，版本 **160**，ES module 构建，原样内置 |
| `lib/jsm/loaders/GLTFLoader.js` | three.js 示例模块 |
| `lib/jsm/utils/BufferGeometryUtils.js` | three.js 示例模块 |

Copyright 2010-2023 Three.js Authors，以 **MIT 许可**分发（`SPDX-License-Identifier: MIT`），
许可头保留在每个内置文件内部。页面导入的是这些本地副本，运行时不从 CDN 拉取任何脚本。

整个场景在加载时全部由 three.js 图元搭建。仓库不含任何第三方 3D 模型文件
（glb / gltf / obj / fbx），上面那个 loader 只为格式兼容而存在，不代表本仓库依赖外部资产。

### 地图下面的公开格网数据

| 层 | 来源 | 说明 |
|---|---|---|
| `assets/region.jpg`、`assets/relief.png`、`assets/ext_depth.bin` | **GEBCO 海图**（国际测深汇编） | 重采样并重新着色成战术深度图。© GEBCO, NIO,代表 UNESCO 政府间海洋学委员会。GEBCO 格网可依其使用指南免费使用与再分发；再分发时请保留本告知。 |
| 方块地形与岛屿高程场 | 基于 **SRTM**（NASA / USGS）的全球高程，以公开数据形式提供 terrarium 编码地形瓦片 | SRTM 为美国政府作品、不含版权；瓦片服务由其托管方作为开放数据提供。 |
| 全仓库的陆地配色，含近景岛块 `assets/islands/*.bin` | **由本仓库自行计算**（输入只有上面那份高程格网） | 等高设色：与 `assets/relief.png` 同一张"高程 → 颜色"档表，坡面明暗也从同一片高程算。本仓库的地图里没有任何一处采样卫星或航空影像，因此不存在需要署名的第三方栅格，也不存在"公开再分发前要先删掉的东西"。（`assets/coast.bin` 是 float32 的 0 米等值线段，只有几何、没有颜色。） |

### 可选的云端持久化 —— 出厂即停用

`js/wgcloud.js` 是一个作为**模板**保留的落盘适配器。它的端点、租户、密钥与 SDK 地址都是
占位符（`<PUBLISHABLE_KEY>`、`<CLOUD_SDK_URL>` …），并且只有当 `location.hostname` 与你配置
的端点一致时才激活 —— 任何公开检出的副本都不可能满足这个条件。开箱状态下它不加载任何东西、
不访问任何服务，退回浏览器本地存储。需要共享推演历史时，接你自己的存储后端。

### 出版物与链接

方法类页面按 URL 引用了学术与官方出版物（齐射模型文献、决策流程实践、军种期刊）。
这些作品归其作者与出版方所有；这里只出现链接与简短的事实性署名，不含任何副本。

### 名称

真实的装备、部队与地名出现在这里，是因为公开出处用的就是这些词。这是描述，不是背书，
也不意味着与任何组织的隶属或合作关系。

### 其余什么都不加载

对随仓库发布的页面逐条统计：无 web 字体、无远程脚本、无远程图片、无统计代码。
访客浏览器唯一发出的对外请求，是访客自己主动点开的引用链接。
