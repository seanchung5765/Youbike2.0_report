# 1. 使用官方的 Node.js 輕量版映像檔 (Node 20 LTS Alpine)
FROM node:20-alpine

# ⚠️ 如果你的 Node.js 會執行 Python 腳本 (main.py)，請把下面這行開頭的 # 拿掉
# RUN apk add --no-cache python3 make g++

# 2. 設定容器內部的工作目錄
WORKDIR /usr/src/app

# 3. 先複製 package.json 和 package-lock.json (利用 Layer Cache 加速建置)
COPY package*.json ./

# 4. 安裝專案的依賴套件 (加上 --omit=dev 只安裝正式環境需要的套件，大幅瘦身)
RUN npm install --omit=dev

# 5. 複製專案的所有程式碼到容器內
# (記得搭配 .dockerignore 把 1app.js, webreport_userdb/ 等不要的檔案過濾掉)
COPY . .

# 6. 宣告容器會使用的 Port (標示作用，Cloud Run 會動態注入 PORT 環境變數)
EXPOSE 3000

# 7. 定義容器啟動時執行的預設指令
# 若你的進入點是 app.js 請用下面這行：
CMD ["node", "app.js"]

# 若你的進入點是 ./bin/www (Express 預設)，請改用這行並把上面那行註解掉：
# CMD ["npm", "start"]