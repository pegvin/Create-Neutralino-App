export default {
	"default-neu": {
		src: "neutralinojs/neutralinojs-zero",
		commands: [
			{
				command: "neu run",
				description: "Launches The App."
			},
			{
				command: "neu build --release",
				description: "Builds your App into Executables."
			}
		]
	},
	"svelte": {
		src: "DEVLOPRR/svelte-neutralino-template",
		commands: [
			{
				command: "npm run dev",
				description: "Launches Rollup And Your Application."
			},
			{
				command: "npm run build",
				description: "Builds your Code And Neutralino App into Executables."
			},
			{
				command: "npm run build:svelte",
				description: "Only Builds Your Svelte Code."
			},
			{
				command: "npm run build:neu",
				description: "Builds your Neutralino App (Doesn't Build Svelte Code)."
			},
			{
				command: "npm run start:neu",
				description: "Only Starts your Neutralino App (Doesn't Start Rollup For Bundling Svelte Code)."
			},
		]
	}
}