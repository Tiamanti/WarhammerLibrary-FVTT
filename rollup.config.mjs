/* eslint-disable no-undef */
import foundryPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy';
import postcss from "rollup-plugin-postcss";
import simpleGit from 'simple-git';
import yargs from 'yargs';
import fs from "fs";


let args = yargs(process.argv.slice(2)).parse();

let latest = args.configLatest;
if (!latest)
{
    latest = await new Promise(resolve => {
        simpleGit({baseDir: process.cwd()}).tags((err, tags) => resolve(tags.latest));
    })
}

let manifest = JSON.parse(fs.readFileSync("./module.json"));
let modulePath = foundryPath(manifest.id, manifest.compatibility.verified);

console.log("Setting Version " + latest)
console.log("Bundling to " + modulePath);


export default {
	input: ['src/warhammer-lib.js'],
	output: {dir: modulePath},
	plugins: [
		copy({
			targets : [
				{src: "./module.json", dest : modulePath, transform: (contents) => contents.toString().replaceAll("@VERSION", latest)},
				{src: "./static/*", dest : modulePath}
			],
            watch: process.env.NODE_ENV == "production" ? false : ["./static/**", "module.json"]
		}),
		postcss({
			extract: "warhammer.css",
			plugins : []
		})
	],
	// output: rollupPaths.map(repoPath => {
	// 	let outputPath = path.join(repoPath, 'warhammer-lib.js')
	// 	return {
	// 		file: outputPath,
	// 		format: 'cjs'
	// 	}
	// })
};