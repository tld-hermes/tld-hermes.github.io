FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html 2048/ sudoku/ lianliankan/ .nojekyll /usr/share/nginx/html/
