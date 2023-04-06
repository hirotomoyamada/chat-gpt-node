# ChatGPT for Node.js

## Install

```sh
$ node -v → v16.**.*
$ pnpm install
```

## Usage

```sh
$ pnpm chat
```

## Command

```sh
# Gets list of currently available models.
$ pnpm model

# Start a chat.
$ pnpm chat

# Specify the model and start a chat
$ pnpm chat gpt-3.5-turbo

# Set initial values ​​to the model
$ pnpm setting

# Set parameters of the model
$ pnpm setting -p

# Reset data other than initial value of currently held messages
$ pnpm reset

# Reset data for currently held all messages
$ pnpm setting -a
```
