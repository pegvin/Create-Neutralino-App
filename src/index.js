#!/usr/bin/env node

// Chalk For Text Highlighting.
import chalk from 'chalk';

// Inquirer For Getting User inputs in various ways.
import inquirer from 'inquirer';

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

// For Interacting With GitHub API and Downloading File From Remote URL.
import fetch from 'node-fetch';

// The Imports Are For Writing The Downloaded File.
import { createWriteStream as fsCreateWriteStream } from 'node:fs';
import { pipeline as nsPipeline } from 'node:stream';
import { promisify as nuPromisify } from 'node:util';

// For Extracting Zip Files.
import JSZip from 'jszip';


/**
 * Check If A GitHub Repo is Valid Or Not.
 * @description Checks if A GitHub Repository does exist and also if that repository contains neutralino.config.json
 * @param {String} userAndRepo Username And Repo in "USERNAME/REPO" Format.
 * @returns True if valid repository else STRING specifying error.
 */
async function validateRepository(userAndRepo) {
	// Get the JSON Data from github API
	const data = await (await fetch(`https://api.github.com/repos/${userAndRepo}`)).json();
	if (data.message && data.message.toLowerCase() == "not found") { // If API returned "not found"
		return "REPO_NOT_FOUND";
	} else {
		// Get the information about "neutralino.config.json" from the github repo.
		const content = await (await fetch(`https://api.github.com/repos/${userAndRepo}/contents/neutralino.config.json`)).json();
		if (content.message && content.message.toLowerCase() == "not found") { // if API returned "not found"
			return "CONFIG_NOT_FOUND";
		} else {
			return true;
		}
	}
}

/**
 * Rename Stuff Like 'name' in package.json and other things.
 * @param {String} appName Name Of The App User Specified.
 * @param {String} appPath Path Where the Template is Downloaded.
 * @param {String} template Name Of The Template User Selected.
 */
function renameTemplate(appName, appPath, template) {
	if (fs.existsSync(path.join(appPath, 'neutralino.config.json'))) {
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
	}

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
async function downloadTemplate(template = templateUrls['default-neu'].src, appName) {
	// Create A Spinner And Start it.
	let spinnerInstance = nanospinner.createSpinner(`Downloading Template`).start();

	try {
		// Get The Template Path And The Zip Path
		const templatePath = path.join(process.cwd(), appName);
		const zipPath = path.resolve(`${appName}-template.zip`);

		const streamPipeline = nuPromisify(nsPipeline);
		const response = await fetch(`https://github.com/${template}/archive/main.zip`);
		if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
		await streamPipeline(response.body, fsCreateWriteStream(zipPath));

		spinnerInstance.update({
			text: `Extracting The Template`
		})

		const zipFileData = fs.readFileSync(zipPath, {
			encoding: 'binary'
		})

		var zip = new JSZip();

		const zipFileContents = await zip.loadAsync(zipFileData);
		let files = Object.keys(zipFileContents.files);
		let rootFolder = path.resolve(files[0]) // Folder Name Which Contains All The Files
		fs.mkdirSync(rootFolder);
		files.shift();

		for (let i = 0; i < files.length; i++) {
			let fileName = files[i];
			// Check if the filename ends with / which means it is a directory.
			if (!fileName.endsWith("/")) { // if it is a file then read it's content and write into it.
				let fileData = await zipFileContents.file(fileName).async("nodebuffer");
				fs.writeFileSync(path.resolve(files[i]), fileData);
			} else { // if filename is a directory then make that directory
				fs.mkdirSync(path.resolve(files[i]))
			}
		}

		fs.renameSync(rootFolder, templatePath);
		fs.rmSync(zipPath);

		// Stop The Spinner With Success.
		spinnerInstance.success({
			text: 'Downloaded & Extracted The Template!'
		});
	} catch (err) {
		spinnerInstance.error({
			text: `Error Occured When Downloading The Template From Remote.`
		})
		error(err)
	}
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

// frontEndLib will hold the library name.
var frontendLib = 'default-neu';

// templateURL will hold the github path to the template repo in "USERNAME/REPO" format.
var templateURL = templateUrls[frontendLib].src;

// If user has passed a argument.
if (process.argv.length > 2) {
	let arg = process.argv[2];
	// check if the repository path format is valid, i.e. "USERNAME/REPO"
	if (arg.split('/').length == 2) {
		// check if the repository passed is a valid repository
		let validRepo = await validateRepository(arg);

		if (validRepo === true) {
			frontendLib = arg.split('/')[1];
			templateURL = arg;
		} else if (validRepo == "REPO_NOT_FOUND") {
			error("Error When Validating The Repository - REPO_NOT_FOUND");
		} else if (validRepo == "CONFIG_NOT_FOUND") {
			error("Error When Validating The Repository - CONFIG_NOT_FOUND")
		}
	} else {
		error('Invalid Argument');
	}
} else { // if no argument is passed then get the input from user.
	// Get The FrontEnd Library User Want's to use.
	frontendLib = await getFrontendLib();
	templateURL = templateUrls[frontendLib].src;
}

// Download The Template.
await downloadTemplate(templateURL, appName);

// Create A Spinner.
let spinnerInstance = nanospinner.createSpinner(`Setting Up`).start();

// Rename The Template.
renameTemplate(appName, path.join(process.cwd(), appName), frontendLib);

// Stop the Spinner.
spinnerInstance.success();

// Show Success Message.
console.log(`\nSuccess! Created ${appName} at ${path.join(process.cwd(), appName)}.`);

// If the selected frontend library is inside `template-urls.js` then log the properties of it like recommended Commands, etc etc.
if (templateUrls[frontendLib]) {
	console.log(`Inside that directory, you can run several commands:\n`);

	// Show The Available Commands in that template.
	for (let i = 0; i < templateUrls[frontendLib].commands.length; i++) {
		let commandObj = templateUrls[frontendLib].commands[i];
		console.log(`  ${neutralinoGradient(commandObj.command)}`);
		console.log(`    ${chalk.hex("#E8E8E8")(commandObj.description)}\n`);
	}
	
	console.log(`We Recommend you to run these commands inside your project directory before doing anything:\n`);
	
	// Show the Recommended Commands.
	for (let i = 0; i < templateUrls[frontendLib].recomendedCommands.length; i++) {
		console.log(`  ${neutralinoGradient(templateUrls[frontendLib].recomendedCommands[i])}`);
	}
}

console.log(`\nHave Fun With ${neutralinoGradient('Neutralino JS')}!\n`);		
