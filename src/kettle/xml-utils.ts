import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * XML parser instance with Kettle-specific options
 */
const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text',
	parseAttributeValue: true,
	parseTagValue: true,
	trimValues: true,
});

/**
 * XML builder instance with Kettle-specific options
 */
const xmlBuilder = new XMLBuilder({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	format: true,
	indentBy: '  ',
	suppressEmptyNode: false,
});

/**
 * Parse Kettle XML file (.ktr or .kjb)
 */
export async function parseKettleXml(filePath: string): Promise<any> {
	const xmlContent = await fs.readFile(filePath, 'utf-8');
	return xmlParser.parse(xmlContent);
}

/**
 * Build Kettle XML from object representation
 */
export function buildKettleXml(obj: any): string {
	const xmlString = xmlBuilder.build(obj);
	// Ensure XML declaration is present
	if (!xmlString.startsWith('<?xml')) {
		return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlString}`;
	}
	return xmlString;
}

/**
 * Write Kettle XML to file
 */
export async function writeKettleXml(filePath: string, obj: any): Promise<void> {
	const xmlString = buildKettleXml(obj);
	await fs.writeFile(filePath, xmlString, 'utf-8');
}

/**
 * Validate Kettle file type (.ktr or .kjb)
 */
export function validateKettleFileType(filePath: string): 'transformation' | 'job' | 'unknown' {
	const ext = path.extname(filePath).toLowerCase();
	if (ext === '.ktr') {
		return 'transformation';
	} else if (ext === '.kjb') {
		return 'job';
	}
	return 'unknown';
}

/**
 * Ensure file is a valid Kettle file
 */
export function ensureKettleFile(filePath: string, expectedType?: 'transformation' | 'job'): void {
	const actualType = validateKettleFileType(filePath);
	if (actualType === 'unknown') {
		throw new Error(`Invalid Kettle file: ${filePath}. Expected .ktr or .kjb`);
	}
	if (expectedType && actualType !== expectedType) {
		throw new Error(
			`Invalid Kettle file type: expected ${expectedType}, got ${actualType} for ${filePath}`
		);
	}
}
