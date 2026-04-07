FROM node:20.0.0

WORKDIR /app
COPY . .
ENV PORT=3000
# clude function url
ENV GCP_URL=https://asia-east1-upheld-now-268802.cloudfunctions.net/frontend_bq2
ENV GCP_EXCEL_URL=https://asia-east1-upheld-now-268802.cloudfunctions.net/excel_bq
ENV GCP_USER_URL=https://asia-east1-upheld-now-268802.cloudfunctions.net/webreport_userdb
ENV LDAP_ACC=GB3192
ENV LDAP_PASSWORD=Dd308132299.
# ENV LDAP_URL=ldap://10.1.30.66:389
ENV LDAP_URL=ldap://61.216.3.230:389
ENV JWT_KEY=YOUBikesecretKey




# mysql
# ENV MYSQL_HOST=10.1.30.150
# ENV MYSQL_USER=GB3192
# ENV MYSQL_PASSWORD=Dd@22495521
# ENV MYSQL_PORT=3306



# gcpmyslq
ENV GCP_MYSQL_HOST=10.3.1.3
# ENV GCP_MYSQL_HOST=35.229.175.138
ENV GCP_MYSQL_USER=GB3192
ENV GCP_MYSQL_PASSWORD=)@y]d3X}:TI+d?Y]
ENV GCP_MYSQL_PORT=3306
ENV GCP_MYSQL_DATABASE=youbike-01




ENV EMAIL_STATUS_URL=https://asia-east1-upheld-now-268802.cloudfunctions.net/bike_status_email
# gmail api
ENV GMAIL_USER=yishaozhan@youbike.com.tw
ENV GMAIL_CLIENT_ID=421613424541-t7l90lhkj1t4usn2uimt5ui958v4cbst.apps.googleusercontent.com
ENV GMAIL_CLIENT_SECRET=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
ENV GMAIL_REFRESH_TOKEN=1//0e-b-Z06ZTDPYCgYIARAAGA4SNwF-L9IrLzcrOHNhfKHUj_Idbp_TNyyQm5uzxuC6hmCd3BvqBqAazXys-G7iQap0J2q2Zw15wmA


RUN ["npm","install"]
EXPOSE 3000

CMD [ "npm","start" ]