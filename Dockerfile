# TODO: finish the multistage docker
# FROM node as base

# COPY ./ /usr/src/app
# WORKDIR /usr/src/app

# RUN yarn install
# RUN yarn lint
# RUN yarn build

FROM node
# COPY --from=base /usr/src/app/server/dist/src /usr/src/app/
# COPY --from=base /usr/src/app/server/node_modules /usr/src/app/node_modules

COPY ./ /usr/src/app

WORKDIR /usr/src/app

ENV NODE_ENV production
EXPOSE 3000

ENTRYPOINT ["node", "index.js"]