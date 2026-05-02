FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy each directory separately to preserve subdirectory structure
COPY index.html /usr/share/nginx/html/
COPY 2048/ /usr/share/nginx/html/2048/
COPY sudoku/ /usr/share/nginx/html/sudoku/
COPY lianliankan/ /usr/share/nginx/html/lianliankan/
COPY sokoban/ /usr/share/nginx/html/sokoban/
COPY .nojekyll /usr/share/nginx/html/
