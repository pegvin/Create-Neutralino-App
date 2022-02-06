# Create Neutralino App
Set up a NeutralinoJS App by running one command.

```bash
npx create-neutralino-app
```

---

## Requirement
- [Node v12.7](https://nodejs.org/download/release/v12.17.0/) or Greater
- NPM Or Yarn
- NPX

---

## Want To Add A Template?

If you have a Template For NeutralinoJS And Want It to be a option in `create-neutralino-app`,

1. Put your template onto a GitHub Repository (Example - [Neutralino Svelte Template](https://github.com/DEVLOPRR/svelte-neutralino-template))
2. Make A Pull Request Adding Properties For Your Template in [`template-urls.js`](https://github.com/DEVLOPRR/Create-Neutralino-App/blob/main/src/template-urls.js)
3. Wait For your Request To Be Pulled.

### Properties For Template:

Your Properties Should Look Like This

```javascript
"mytemplate": {
  src: "USERNAME/REPO-NAME",
  commands: [
    {
      command: "Your Command",
      description: "Your Command Description"
    }
  ],
  recomendedCommands: [
		"my command 1",
		"my command 2",
	]
}
```

- `"mytemplate"` is the Name of your template which will show in CLI Menu
- `src` is template github URL
  - Here your **USERNAME** is the your github username in which the template repository is in.
  - Here your **REPO-NAME** is the repository which contains the template.

- `commands` is list of Commands in your template
  - every command here is a object containing 2 properties:
    - `command` name of the command.
    - `description` a little information about that command.

- `recomendedCommands` is list of Commands which will be recommended to run before doing anything.
  - every command here is a string.

---

# THANKS
