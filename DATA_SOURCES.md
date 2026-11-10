# Data sources · 数据来源

<!-- EN first, 中文 follows. Same facts, two languages. -->

## English

### The rule

**No source, no entry.** A number, a name or a position only enters the data layers when at
least one traceable public reference puts it there. Everything else stays out of the model,
or is demoted to a relative manoeuvre position and is never drawn as a fact.
The repository contains no classified, restricted or non-public material of any kind.

Every record in the data layers carries its own `src` citation and an `updated` date, so the
provenance travels with the number rather than living in a separate document that can drift.

### The confidence grades

| Grade | Meaning | Typical evidence |
|---|---|---|
| `A` | Directly stated by an official or primary publication, with the unit and place named | ministry-of-defence publication, service press release, official photo with unit markings |
| `B` | Reported by a named outlet or a think-tank table, consistent across at least two independent references | wire service, national defence news outlet, industry journal, database of record |
| `C` | Single-source, inferred, or reconstructed from an indirect signal (port visit, exercise listing, transit report) | one report, an encyclopedia entry, a satellite-pass description, a social-media or video source |

`C` is not a polite way of saying "made up" — it says *this is the best open reading available
and you should treat it as provisional*. Where two references disagree, the disagreement is
written into the file as an adjudication instead of being silently resolved.
In the current basing registry: **6 records at `A`, 93 at `B`, 72 at `C`, and 22 recorded
adjudications over 171 sites.**

### What is actually cited

Measured over the shipped `data/*.json`: **564 citation slots pointing at 239 distinct public
URLs on 114 distinct hosts.** Per file:

| File | Citation slots | Distinct URLs |
|---|---|---|
| `data/L1_static.json` | 43 | 41 |
| `data/L2_params.json` | 45 | 41 |
| `data/L2_blue_params.json` | 38 | 32 |
| `data/L2_green_params.json` | 36 | 32 |
| `data/L3_combat.json` | 9 | 8 |
| `data/L4_basing.json` | 273 | 77 |
| `data/L4_blue_denial.json` | 22 | 11 |
| `data/L4_green_ops.json` | 19 | 18 |
| `data/L4_schemes.json` | 16 | 7 |
| `data/L4_strategy.json` | 5 | 5 |
| `data/L5_strategy_ops.json` | 12 | 9 |
| `data/L6_tactical.json` | 46 | 43 |

The reference base is deliberately mixed, because open order-of-battle work is a mixed craft:

- **Primary / official** — defence ministry publications, service news commands,
  public imagery libraries (e.g. `mnd.gov.tw`, `mod.go.jp`, `navy.mil`, `dvidshub.net`).
- **Institutional and industry** — `news.usni.org`, `jamestown.org`, `navalnews.com`,
  `armyrecognition.com`, `globalsecurity.org`, `designation-systems.net`.
- **Press and wire** — `cna.com.tw`, `chinatimes.com`, `ltn.com.tw`, `stripes.com`.
- **Encyclopedic** — `en.wikipedia.org`, `zh.wikipedia.org`, `baike.baidu.com`, used for
  stable technical identity (dimensions, displacement, crew), not for disposition.
- **Regional commentary and video** — used only as weak leads, and graded accordingly.

A citation is a pointer, not a guarantee: sources can be wrong, and outlets retract.
If you check one and it no longer supports the record, that is a finding worth reporting.

### Terrain and bathymetry

The ground truth under the map is an **open grid**, not photography:

- **Seafloor and coastal depth** — the GEBCO chart, sampled as tiles and baked into
  `assets/region.jpg`, `assets/relief.png` and `assets/ext_depth.bin`.
- **Land elevation** — the SRTM-derived global elevation model, served as open terrain tiles
  (terrarium encoding), sampled into the block terrain and the local island height fields.
- **Land colour, including on the close-in island blocks** — computed here from the elevation
  grid itself (one elevation→colour table, shared with `assets/relief.png`, hill-shaded from
  the same grid). No satellite or aerial imagery is sampled anywhere in the shipped map.

Heights and depths are stored as numbers (`float32` / `float16` grids), and the tactical
colouring you see on the water is computed in the page from those depths — the dark-blue-to-teal
depth ramp is a rendering choice, not a source claim.

### Checking or replacing a number

1. Open the layer file that owns the value (see the layer table in the README).
2. Read the record's `src` and `updated` fields.
3. Open the source. If it agrees, you have verified the model. If it does not, change the one
   record in the one file that owns it — every screen reads from that file, so the map, the
   catalogue, the order of battle and the run engine all move together.
4. If two credible sources conflict, keep both readings and write the choice down in the
   record, the same way the 22 standing adjudications do.

The data-generation scripts are not part of this repository: what ships here is the product —
the pages and the data files they read. That is intentional, so that a reader can inspect the
same bytes the engine inspects.

---

## 中文

### 总则

**无源不入库。** 一个数、一个名字、一个点位，只有在至少一条可追溯的公开出处把它放在那里
时，才进数据层。其余的要么不进模型，要么降级成相对机动位置，并且永远不会被画成事实。
仓库中不含任何涉密、受控或非公开材料。

数据层里每条记录都自带 `src` 出处和 `updated` 日期 ——  provenance 跟着数字走，
而不放在一份会各自漂移的独立文档里。

### 可信度分级

| 级 | 含义 | 典型证据 |
|---|---|---|
| `A` | 官方或一手出版物直接写明，部队与地点都点名 | 防务部门出版物、军种新闻稿、带部队标识的官方照片 |
| `B` | 具名媒体或智库表格报道，且至少两条独立出处互相印证 | 通讯社、国防类媒体、行业期刊、权威数据库 |
| `C` | 单一出处、间接推断，或从间接信号（靠港、演训清单、过航报道）复原 | 一条报道、一条百科、一次过境描述、社群或视频来源 |

`C` 不是「编的」的客气说法，它的意思是*这是目前能拿到的最好的公开读法，你应当把它当作临时结论*。
两条出处对不上时，分歧作为一条「裁决」写进文件，而不是悄悄选一个。
当前部署登记表里：**171 个点位中 `A` 级 6 条、`B` 级 93 条、`C` 级 72 条，另有 22 条在册裁决。**

### 到底引了什么

对随仓库发布的 `data/*.json` 逐条统计：**564 个出处槽位，指向 114 个域名上的 239 条不同公开 URL。**
分文件：见上表（表格对两种语言通用）。

参照体系是刻意混着用的，因为公开的编成研究本身就是一门混着用的手艺：

- **一手 / 官方** —— 防务部门出版物、军种新闻单位、公开影像资料库。
- **机构与行业** —— 智库、行业期刊、装备数据库。
- **报刊与通讯社** —— 区域媒体的防务报道。
- **百科** —— 只用于稳定的技术身份（尺度、排水量、编制人数），不用于部署位置。
- **区域评论与视频** —— 只当弱线索用，分级也按弱线索给。

出处是一个指针，不是一纸保证：来源本身会错，媒体也会更正。
如果你点开某条出处发现它已经不再支持这条记录，那是一个值得反馈的发现。

### 地形与测深

地图下面的地面真值是一张**公开格网**，不是照片：

- **海底与近岸深度** —— GEBCO 海图，按瓦片采样后烘焙进 `assets/region.jpg`、
  `assets/relief.png`、`assets/ext_depth.bin`。
- **陆地高程** —— 基于 SRTM 的全球高程模型，以公开地形瓦片（terrarium 编码）供给方块地形
  与岛屿局部高程场。
- **陆地颜色（含近景岛块）** —— 由本仓库就着高程格网自己算：一套"高程 → 颜色"档表，
  与 `assets/relief.png` 共用，坡面明暗也从同一片高程算。地图里没有任何一处采样卫星或航空影像。

高程与深度都以数字存储（`float32` / `float16` 格网），海面上那套由深黑到青绿的渐变是页面
按深度**算出来的渲染选择**，不是一条出处声明。

### 怎么核、怎么换

1. 找到拥有这个数的那一层（层的归属见 README 的表）。
2. 读这条记录的 `src` 与 `updated`。
3. 打开出处。对得上，你就复核了模型；对不上，只改拥有它的那一条记录 ——
   所有页面都从同一个文件读，所以大地图、图鉴、编成表和推演引擎会一起动。
4. 两条可信出处互相冲突时，把两种读法都留下，并按在册 22 条裁决的写法把取舍理由写进记录。

数据生成脚本不在本仓库里：这里发布的是成品 —— 页面和它们读取的数据文件。
这是刻意的，好让读者检查的和引擎检查的是同一批字节。
