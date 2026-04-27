import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const README_PATH = path.join(ROOT, 'README.md');
const START_MARKER = '<!-- docs-index:start -->';
const END_MARKER = '<!-- docs-index:end -->';

async function getMarkdownFiles(dir, baseDir = dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return getMarkdownFiles(fullPath, baseDir);
			}
			if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) {
				return [];
			}
			return [path.relative(baseDir, fullPath).replaceAll(path.sep, '/')];
		})
	);

	return files.flat().sort((a, b) => a.localeCompare(b));
}

function fallbackTitle(filePath) {
	return path.basename(filePath, '.md').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getTitleFromMarkdown(filePathRelativeToDocs) {
	const absolutePath = path.join(DOCS_DIR, filePathRelativeToDocs);
	const content = await readFile(absolutePath, 'utf8');
	const heading = content.match(/^#\s+(.+)$/m);
	return heading?.[1]?.trim() || fallbackTitle(filePathRelativeToDocs);
}

function buildIndexBlock(items) {
	if (items.length === 0) {
		return `${START_MARKER}\n- (No documentation files found in [docs](docs/))\n${END_MARKER}`;
	}

	const lines = items.map((item) => `- [${item.title}](docs/${item.relativePath})`);
	return `${START_MARKER}\n${lines.join('\n')}\n${END_MARKER}`;
}

async function updateReadme(block) {
	const readme = await readFile(README_PATH, 'utf8');
	const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);

	if (!pattern.test(readme)) {
		throw new Error(
			`Could not find docs index markers in README.md. Add ${START_MARKER} and ${END_MARKER} first.`
		);
	}

	const next = readme.replace(pattern, block);
	await writeFile(README_PATH, next, 'utf8');
}

async function main() {
	const files = await getMarkdownFiles(DOCS_DIR);
	const items = await Promise.all(
		files.map(async (relativePath) => ({
			relativePath,
			title: await getTitleFromMarkdown(relativePath)
		}))
	);

	const block = buildIndexBlock(items);
	await updateReadme(block);
	console.log(`Updated docs index with ${items.length} file(s).`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
