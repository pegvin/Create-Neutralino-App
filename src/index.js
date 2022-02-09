#!/usr/bin/env node

// Chalk For Text Highlighting.
import chalk from 'chalk';

// Inquirer For Getting User inputs in various ways.
import inquirer from 'inquirer';

// Degit For Cloning The Template.
import degit from 'degit';

// Gradient String For Making Gradient Text.
import gradient from 'gradient-string';

// NanoSpinner For Spinners.
import nanospinner from 'nanospinner';

// Path to work with paths.
import path from 'path';

// Process For Getting Current Working Directory And Exiting The Program.
import process from 'process';

// FS For Interacting With File System.
import fs from 'fs';

// Template URLs to get the information about the template.
import templateUrls from './template-urls.js';

/**
 * Rename Stuff Like 'name' in package.json and other things.
 * @param {String} appName Name Of The App User Specified.
 * @param {String} appPath Path Where the Template is Downloaded.
 * @param {String} template Name Of The Template User Selected.
 */
function renameTemplate(appName, appPath, template) {
	// Read the Neutralino Config File.
	var configJSON = fs.readFileSync(path.join(appPath, 'neutralino.config.json'), {
		encoding: 'utf-8'
	});

	// Convert the data of Neutralino Config File From JSON To JavaScript Object.
	configJSON = JSON.parse(configJSON);

	// Change The Properties.
	configJSON.applicationId = `js.neutralino.${template}`;
	configJSON.modes.window.title = appName;
	configJSON.cli.binaryName = appName;

	// Convert The JS Object Back To JSON.
	const stringJSON = JSON.stringify(configJSON, null, 2);

	// Write New Data into the Neutralino Config File.
	fs.writeFileSync(path.join(appPath, 'neutralino.config.json'), stringJSON, {
		encoding: 'utf-8'
	});

	// Check If package.json exists inside the downloaded template, if it does then change properties of it too.
	if (fs.existsSync(path.join(appPath, 'package.json'))) {
		// Remove the package-lock.json if it exists.
		if (fs.existsSync(path.join(appPath, 'package-lock.json'))) {
			fs.rmSync(path.join(appPath, 'package-lock.json'))
		}

		// Read the data from package.json
		var pkgJSON = fs.readFileSync(path.join(appPath, 'package.json'), {
			encoding: 'utf-8'
		});

		// Convert The JSON Data into JavaScript Object.
		pkgJSON = JSON.parse(pkgJSON);

		// Change Some Properties.
		pkgJSON.name = appName.toLowerCase();

		// Will Improve This Later (my regex is horrible XD)
		let regexChars = [
			/\ /g, /\_/g, /\@/g, /\+/g, /\=/g,
			/\~/g, /\`/g, /\"/g, /\'/g, /\:/g,
			/\;/g, /\|/g, /\\/g, /\//g, /\</g,
			/\>/g, /\?/g, /\,/g, /\./g, /\!/g,
			/\#/g, /\$/g, /\%/g, /\^/g, /\&/g,
			/\(/g, /\)/g
		];

		// Run A For Loop For Checking Unwanted Characters in the name and replace them with a "-".
		for (let i = 0; i < regexChars.length; i++) {
			pkgJSON.name = pkgJSON.name.replace(regexChars[i], '-');
		}

		// Convert JS Object Back To JSON Data.
		const stringJSON = JSON.stringify(pkgJSON, null, 2);

		// Write the new JSON Data.
		fs.writeFileSync(path.join(appPath, 'package.json'), stringJSON, {
			encoding: 'utf-8'
		});
	}
}

/**
 * Download The Template From GitHub.
 * @param {String} template Name Of the Template User Selected.
 * @param {String} appName Name Of the App User Specified.
 */
async function downloadTemplate(template = 'default-neu', appName) {
	// Create A Spinner And Start it.
	let spinnerInstance = nanospinner.createSpinner(`Downloading Template`).start();

	// Get The Template Path.
	const templatePath = path.join(process.cwd(), appName);

	// Initialize Degit To Clone The Template.
	var degitInstance = degit(templateUrls[template].src);

	// Clone The Template To The Template Path.
	await degitInstance.clone(templatePath);

	// Stop The Spinner With Success.
	spinnerInstance.success({
		text: 'Downloaded The Template!'
	});
}

/**
 * Get App Name From User Via CLI.
 * @returns {String} Name Of The App.
 */
async function getAppName() {
	// Get The App Name Using inquirer
	const answers = await inquirer.prompt({
		name: 'app_name', // Answer Identifier
		type: 'input', // Input Type.
		message: 'What is your App Name?', // Message To Prompt.
		default() { // Default Value.
			return 'myApp';
		},
	});

	// Return the app name using the Answer Identifier we specified above.
	return answers.app_name;
}

/**
 * Get the frontend library user wants to use with Neutralino.
 * @returns {String} FrontEnd Library User Selected.
 */
async function getFrontendLib() {
	// Convert The Template Name from the Object Keys inside templateURLs.
	let choices = Object.keys(templateUrls);
	choices[0] = "None"; // Set the first choice to "None" which is "default-neu".

	// Run a for-loop to turn the first Letter of the choices to uppercase.
	for (let i = 0; i < choices.length; i++) {
		choices[i] = choices[i].charAt(0).toUpperCase() + choices[i].slice(1);
	}

	// Get Answer From User Using inquirer.
	const answers = await inquirer.prompt({
		name: 'frontend_lib', // Answer Identifier.
		type: 'list', // Type of the prompt
		message: 'Choose A Frontend Library To Use\n', // Message to prompt.
		choices: choices // Choices to choose from.
	});

	// if answer is none then return 'default-neu' as the template name.
	if (answers.frontend_lib.toLowerCase() == 'none') {
		return 'default-neu';
	} else { // else return the template name in lowercase.
		return answers.frontend_lib.toLowerCase();
	}
}

/**
 * A Simple Function To wrap exiting and showing a error message.
 * @param {String} message Message to show on exit.
 * @param {Number} exitCode Exit Code.
 * @param {Boolean} shouldContinue Should the script continue or just exit with the exit code.
 */
function error(message, exitCode = 1, shouldContinue = false) {
	nanospinner.createSpinner(`Error`).error({
		text: message
	});
	if (!shouldContinue) {
		process.exit(exitCode);
	}
}

// Neutralino Gradient To Use For Highlighting Special Text.
const neutralinoGradient = gradient('#F89901', '#FFBE32', '#FF5C33');

// Welcome The User With Custom Gradient.
console.log(`${chalk.bold(neutralinoGradient('Welcome!'))}\n`);

// Get The App name.
var appName = await getAppName();

// If App Name is greater then 214 show error and exit.
if (appName.length > 214) {
	error(`App Name Should Be Less Than or Equal To 214 Characters`);
}

// Get The FrontEnd Library User Want's to use.
var frontendLib = await getFrontendLib();

// Download The Template.
await downloadTemplate(frontendLib, appName);

// Create A Spinner.
let spinnerInstance = nanospinner.createSpinner(`Setting Up`).start();

// Rename The Template.
renameTemplate(appName, path.join(process.cwd(), appName), frontendLib);

// Stop the Spinner.
spinnerInstance.success();

// Show Success Message.
console.log(`\nSuccess! Created ${appName} at ${path.join(process.cwd(), appName)}.\nInside that directory, you can run several commands:\n`);

// Show The Available Commands in that template.
for (let i = 0; i < templateUrls[frontendLib].commands.length; i++) {
	let commandObj = templateUrls[frontendLib].commands[i];
	console.log(`  ${neutralinoGradient(commandObj.command)}
    ${chalk.hex("#E8E8E8")(commandObj.description)}\n`);
}

console.log(`We Recommend you to run these commands inside your project directory before doing anything:\n`);

// Show the Recommended Commands.
for (let i = 0; i < templateUrls[frontendLib].recomendedCommands.length; i++) {
	console.log("  " + neutralinoGradient(templateUrls[frontendLib].recomendedCommands[i]));
}

console.log(`\nHave Fun With ${neutralinoGradient('Neutralino JS')}!\n`);
