export default {
	"default-neu": {
		src: "neutralinojs/neutralinojs-minimal",
		commands: [
			{
				command: "neu run",
				description: "Launches The App."
			},
			{
				command: "neu build --release",
				description: "Builds your App into Executables."
			}
		],
		recomendedCommands: [
			"neu update",
			"neu run",
		]
	},
	"svelte": {
		src: "DEVLOPRR/svelte-neutralino",
		commands: [
			{
				command: "npm run dev",
				description: "Launches Your Application With Hot Reloading."
			},
			{
				command: "npm run build",
				description: "Builds your whole App."
			},
			{
				command: "npm run build:svelte",
				description: "Only Builds Your Svelte Code."
			},
			{
				command: "npm run build:neu",
				description: "Builds your Neutralino App."
			},
			{
				command: "npm run start:neu",
				description: "Only Starts your Neutralino App."
			},
		],
		recomendedCommands: [
			"npm install",
			"npx neu update",
			"npm run dev"
		]
	},
	"react": {
		src: "DEVLOPRR/react-neutralino",
		commands: [
			{
				command: "npm start",
				description: "Launches Your Application with Hot Reloading."
			},
			{
				command: "npm run build",
				description: "Builds your whole App."
			},
			{
				command: "npm run start:neu",
				description: "Only Starts your Neutralino App."
			},
			{
				command: "npm run start:react",
				description: "Only Starts your react App."
			},
			{
				command: "npm run build:react",
				description: "Builds Your React Code."
			},
			{
				command: "npm run build:neu",
				description: "Builds your Neutralino App."
			}
		],
		recomendedCommands: [
			"npm install",
			"npx neu update",
			"npx build:react",
			"npm start"
		]
	}
}