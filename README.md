# Voice Chat Application

This repository contains both the frontend and backend code for a real-time voice chat application. The frontend is built using Vue.js, while Strapi powers the backend. The real-time functionality is enabled by WebRTC with PeerJS.

## Project Structure

```
voice-chat-api/
voice-chat-frontend/
```

### voice-chat-api

The backend of the application, built with Strapi.

#### Project setup

```sh
npm install
```

#### Start the development server

```sh
npm run develop
# or
yarn develop
```

#### Start the production server

```sh
npm run start
# or
yarn start
```

#### Build the admin panel

```sh
npm run build
# or
yarn build
```

For more information, see the [Strapi CLI documentation](https://docs.strapi.io/dev-docs/cli).

### voice-chat-frontend

The frontend of the application, built with Vue.js.

#### Project setup

```sh
npm install
```

#### Compiles and hot-reloads for development

```sh
npm run serve
```

#### Compiles and minifies for production

```sh
npm run build
```

### PeerJS Server

PeerJS server for signaling.

#### Install PeerJS Globally

```bash
npm install peer -g
```

#### Start the PeerJS Server

```bash
peerjs --port 9000 --key peerjs --path /myapp
```


For more information, see the [Vue CLI documentation](https://cli.vuejs.org/config/).

## Deployment

For deployment options, refer to the [Strapi deployment documentation](https://docs.strapi.io/dev-docs/deployment).

## Learn More

- [Strapi documentation](https://docs.strapi.io)
- [Vue.js documentation](https://vuejs.org/v2/guide/)

## Community

- [Strapi Discord](https://discord.strapi.io)
- [Strapi Forum](https://forum.strapi.io/)
- [Vue.js Forum](https://forum.vuejs.org/)

---
