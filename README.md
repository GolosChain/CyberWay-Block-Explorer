# CyberWay Block Explorer Frontend server

## Install

```
git clone git@github.com:GolosChain/cyberway-block-explorer.git
cd cyberway-block-explorer

# if you want latest development version
# git checkout develop
```

## Start in Docker

```
cd docker
vim .env
```

Write this:
```
# Url of cyberway blockchain. example: http://cyberway-node-url:8888
GLS_CYBERWAY_CONNECT=
# Server name of nats. example: blocks
GLS_BLOCKCHAIN_BROADCASTER_SERVER_NAME=
# Client name of nats. example: client-blocks
GLS_BLOCKCHAIN_BROADCASTER_CLIENT_NAME=
# Url of Nats. example: nats://$USER:$PASSWORD@cyberway-node-url:4222
GLS_BLOCKCHAIN_BROADCASTER_CONNECT=

# Skip genesis data or not
GLS_SKIP_GENESIS=false

```

```
docker-compose up -d --build
```
