# 《守夜人》H5 永久发布指南

`127.0.0.1:62180` 是本机演示地址，只在这台电脑、且静态服务运行时有效，不能发到微信群或公众号。要获得可分享的公网链接，请把整个文件夹上传到静态托管。

## 方案 A：GitHub Pages（推荐，免费、稳定、链接长期不变）

1. 登录 GitHub，新建一个 **Public** 仓库，例如 `night-watch-smart-care`。
2. 解压 `smart-community-care-h5.zip`，把文件夹里的全部内容上传到仓库根目录，确保 `index.html` 在根目录。
3. 进入仓库 **Settings → Pages**。
4. **Source** 选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存。
5. 等待 1—3 分钟，访问：
   `https://你的GitHub用户名.github.io/night-watch-smart-care/`

说明：GitHub Pages 适合公开科普作品；仓库和页面都是公开的。页面是纯静态的，不需要服务器或数据库。

## 方案 B：Netlify Drop（最省事，拖拽上传）

1. 打开 `https://app.netlify.com/drop`。
2. 把解压后的 `smart-community-care-h5` 文件夹直接拖进页面。
3. 登录/注册 Netlify 后认领站点，获得 `https://xxx.netlify.app` 地址。
4. 在站点设置中可绑定自己的域名；免费额度对社区科普通常足够。

## 方案 C：自己的服务器或单位网站

1. 把解压后的文件夹上传到网站根目录或子目录。
2. 确保 `index.html`、`styles.css`、`app.js`、`favicon.svg`、`downloads/` 保持相对路径。
3. 访问 `https://你的域名/子目录/`。
4. 建议开启 HTTPS；公众号和微信内打开更稳定。

## 发布后检查

- 手机和电脑都能打开首页。
- 三次判断可完成，守夜卡能生成。
- “操作说明 PDF / 创作说明 PDF”链接可下载。
- 微信内打开一次，确认没有被拦截。
- 如更新内容，重新上传覆盖即可，链接不变。

## 关于“永久”

严格意义上的“永久”不存在，托管平台政策、账号状态和域名续费都会影响可用性。对公益科普作品，GitHub Pages + 公开仓库是成本最低、较稳定的方案；如果用于正式长期项目，建议使用单位服务器或自有域名，并保留源文件与部署说明。

## 源文件

- `index.html`：页面结构、文案、数据卡与来源
- `styles.css`：样式、响应式、大字模式
- `app.js`：交互、计分、时间轴、隐私、识伪卡、守夜卡
- `favicon.svg`：站点图标
- `downloads/`：操作说明与创作说明的 DOCX/PDF
- `README.md`：项目说明
