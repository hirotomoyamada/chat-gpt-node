# ChatGPT for Node.js

## Install

```sh
$ node -v → v18.**.*
$ (pnpm|yarn|npm) install
```

## Usage

```sh
$ (pnpm|yarn|npm) chat
```

## Command

```sh
# Check the current default model.
$ pnpm model

# Create a model.
$ pnpm model --create
$ pnpm model -c

# Edit a model.
$ pnpm model --edit
$ pnpm model -e

# Specify the model and edit a chat
$ pnpm model --edit [model-name]
$ pnpm model -e [model-name]

# Edit only the prompt of a model.
$ pnpm model --prompt
$ pnpm model -p

# Specify the model and edit only the prompt of a chat
$ pnpm model --prompt [model-name]
$ pnpm model -p [model-name]

# Delete a model.
$ pnpm model --delete
$ pnpm model -d

# Specify the model and delete a chat
$ pnpm model --delete [model-name] [model-name] ...
$ pnpm model -d [model-name] [model-name] ...

# Change the default model.
$ pnpm model --select
$ pnpm model -s

# Get a list of models.
$ pnpm models

# Get a list of models with parameters.
$ pnpm models --parameters
$ pnpm models -p

# Get a list of internal models.
$ pnpm models --internal
$ pnpm models -i

# Gets list of currently available models.
$ pnpm models --remote
$ pnpm models -r

# Start a chat. Model to be used is the default.
$ pnpm chat

# Select a model and start the chat.
$ pnpm chat --select
$ pnpm chat -s

# Specify the model and start a chat
$ pnpm chat [model-name]

# Delete conversation history of models.
$ pnpm history

# Delete conversation history of all models.
$ pnpm history --all
$ pnpm history -a
```
