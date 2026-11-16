# 作品集網站的「食譜」：用 Nginx（輕量網頁伺服器）把 site/ 資料夾變成一個可執行的網站
FROM nginx:1.27-alpine

LABEL description="黃煜晏 線上作品集"

# 清掉 Nginx 內建的歡迎頁
RUN rm -rf /usr/share/nginx/html/*

# 只複製網站本體（site/）與伺服器設定
COPY site/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 每 30 秒自我檢查一次網站是否正常
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
