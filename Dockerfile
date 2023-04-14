FROM node:slim
LABEL author="shubhampc16@gmail.com"
WORKDIR /app
COPY . .
RUN npm install 
EXPOSE 5000
CMD node index.js 

