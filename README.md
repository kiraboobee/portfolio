# Kira Huang（黃煜晏）線上作品集

米白底、冰山雪地與企鵝主題的作品集網站。純 HTML / CSS / JavaScript，不需要資料庫。

## 資料夾說明

```
portfolio/
├── site/                     ← 網站本體（會被放上網路的只有這個資料夾）
│   ├── index.html            頁面骨架、冰山場景、企鵝
│   ├── content/
│   │   ├── site.json         ★ About、CV、Contact 等文字
│   │   └── works.json        ★ 作品清單（名稱、媒材、時間、標籤、說明）
│   ├── media/                ★ 作品圖片、影片、3D 模型檔
│   │   └── uploads/          從線上後台上傳的檔案會存在這裡
│   ├── admin/                線上編輯後台（網址：/admin/）
│   └── assets/               樣式與程式（顏色字體在 css/style.css）
├── Dockerfile                把 site/ 打包成 Docker 映像的食譜
├── nginx.conf                網頁伺服器設定
├── docker-compose.yml        在自己電腦預覽用
└── .github/workflows/        推送到 GitHub 後自動打包映像
```

## 三種更新方式

1. **線上後台**：打開 `https://kiraboobee.me/admin/`，用 GitHub 權杖登入，直接打字、上傳檔案、拖曳排序，按儲存。
2. **請 Claude 改**：直接說要改什麼。
3. **自己改檔案**：編輯 `site/content/*.json`。

三種方式最後都是把變更存進 GitHub，Cloudflare Pages 偵測到後約一分鐘自動更新網站。

## 檔案大小限制（免費方案）

- 單一檔案 25 MB 以內（Cloudflare Pages 的限制）
- 影片建議放 YouTube / Vimeo 後填影片 ID；短片可壓縮後直接上傳
- 3D 模型請用 `.glb` 格式

## 在自己電腦預覽（Docker）

```
docker compose up
```

打開 http://localhost:8080 。改了檔案後重新整理瀏覽器即可。按 Ctrl+C 停止。

## 打包成正式映像

```
docker build -t portfolio:1.0 .
docker run -d -p 8080:80 --name portfolio portfolio:1.0
```
