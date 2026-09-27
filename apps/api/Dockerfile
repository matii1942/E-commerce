# Alpine, ahora que se puede.
#
# Esta imagen era node:22-slim (Debian) por bcrypt, que es un módulo nativo:
# se compila contra la librería de C del sistema, y los binarios que publica
# son para glibc, no para la musl de Alpine. Al reemplazar bcrypt por bcryptjs
# —JavaScript puro, y de paso sin la cadena node-pre-gyp → tar que traía la
# vulnerabilidad crítica— desapareció el único motivo para no usar Alpine.
#
# Ninguna de las cinco dependencias que quedan es nativa.
FROM node:22-alpine

WORKDIR /app

# Las dependencias primero y en su propia capa: mientras package.json no
# cambie, Docker reutiliza esta capa y no vuelve a instalar nada.
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm ci --omit=dev

# La API sirve también los archivos de la tienda, así que los dos van adentro.
COPY apps/api ./apps/api
COPY apps/web ./apps/web

WORKDIR /app/apps/api
EXPOSE 3001

CMD ["node", "src/app.js"]
