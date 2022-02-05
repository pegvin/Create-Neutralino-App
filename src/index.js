#!/usr/bin/env node

// Will add comments later
import chalk from 'chalk';
import inquirer from 'inquirer';
import degit from 'degit';
import gradient from 'gradient-string';
import nanospinner from 'nanospinner';
import templateUrls from './template-urls.js';
import path from 'path';
import process from 'process';
import fs from 'fs';

function renameTemplate(appName, appPath, template) {
	var configJSON = fs.readFileSync(path.join(appPath, 'neutralino.config.json'), {
		encoding: 'utf-8'
	});

	configJSON = JSON.parse(configJSON);
	configJSON.applicationId = `js.neutralino.${template}`;
	configJSON.modes.window.title = appName;
	configJSON.cli.binaryName = appName

	const stringJSON = JSON.stringify(configJSON, null, 2);
	fs.writeFileSync(path.join(appPath, 'neutralino.config.json'), stringJSON, {
		encoding: 'utf-8'
	})

	if (fs.existsSync(path.join(appPath, 'package.json'))) {
		if (fs.existsSync(path.join(appPath, 'package-lock.json'))) {
			fs.rmSync(path.join(appPath, 'package-lock.json'))
		}

		var pkgJSON = fs.readFileSync(path.join(appPath, 'package.json'), {
			encoding: 'utf-8'
		});

		pkgJSON = JSON.parse(pkgJSON);
		pkgJSON.name = appName.toLowerCase();

		// Will Improve This Later (my regex is horrible XD)
		let regexChars = [
			/\ /g, /\_/g, /\@/g, /\+/g, /\=/g,
			/\~/g, /\`/g, /\"/g, /\'/g, /\:/g,
			/\;/g, /\|/g, /\\/g, /\//g, /\</g,
			/\>/g, /\?/g, /\,/g, /\./g, /\!/g,
			/\#/g, /\$/g, /\%/g, /\^/g, /\&/g,
			/\(/g, /\)/g
		]
		
		for (let i = 0; i < regexChars.length; i++) {
			pkgJSON.name = pkgJSON.name.replace(regexChars[i], '-');
		}

		const stringJSON = JSON.stringify(pkgJSON, null, 2);
		fs.writeFileSync(path.join(appPath, 'package.json'), stringJSON, {
			encoding: 'utf-8'
		})
	}
}

async function downloadTemplate(template = 'default-neu', appName) {
	let spinnerInstance = nanospinner.createSpinner(`Downloading Template`).start();

	const templatePath = path.join(process.cwd(), appName);
	var degitInstance = degit(templateUrls[template].src);
	await degitInstance.clone(templatePath);

	spinnerInstance.success({
		text: 'Downloaded The Template!'
	});
}

async function getAppName() {
	const answers = await inquirer.prompt({
		name: 'app_name',
		type: 'input',
		message: 'What is your App Name?',
		default() {
			return 'myApp';
		},
	});

	return answers.app_name;
}

async function getFrontendLib() {
	const answers = await inquirer.prompt({
		name: 'frontend_lib',
		type: 'list',
		message: 'Choose A Frontend Library To Use\n',
		choices: [
			'None',
			'Svelte'
		]
	});

	if (answers.frontend_lib.toLowerCase() == 'none') {
		return 'default-neu';
	} else {
		return answers.frontend_lib.toLowerCase();
	}
}

function error(message, exitCode = 1, shouldContinue = false) {
	nanospinner.createSpinner(`Error`).error({
		text: message
	})
	if (shouldContinue) {
		return;
	} else { // I know i could directly use this without else statement but i just like it. XD
		process.exit(exitCode);
	}
}

function welcome() {
	console.log(`${chalk.bold(neutralinoGradient('Welcome!'))}\n`);
}

const neutralinoGradient = gradient('#F89901', '#FFBE32', '#FF5C33');

welcome();

var appName = await getAppName();

if (appName.length > 214) {
	error(`App Name Should Be Less Than or Equal To 214 Characters`);
}

var frontendLib = await getFrontendLib();
await downloadTemplate(frontendLib, appName);

let spinnerInstance = nanospinner.createSpinner(`Setting Up`).start();
renameTemplate(appName, path.join(process.cwd(), appName), frontendLib);
spinnerInstance.success();

console.log(`\nSuccess! Created ${appName} at ${path.join(process.cwd(), appName)}.\nInside that directory, you can run several commands:\n`);

for (let i = 0; i < templateUrls[frontendLib].commands.length; i++) {
	let commandObj = templateUrls[frontendLib].commands[i];
	console.log(`  ${neutralinoGradient(commandObj.command)}
    ${chalk.hex("#E8E8E8")(commandObj.description)}\n`);
}

console.log(`We Recommend you to run these commands before doing anything:\n
  ${neutralinoGradient(`cd ${appName}/`)}
  ${neutralinoGradient(`npx neu update`)}\n`);

console.log(`Have Fun With ${neutralinoGradient('Neutralino JS')}!\n`);
