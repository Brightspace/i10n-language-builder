'use strict';

var errors = require('./errors'),
	fs = require('q-io/fs'),
	path = require('path'),
	Q = require('q'),
	winston = require('winston');

winston.cli();

if(process.env.NODE_ENV === 'test') {
	winston.remove(winston.transports.Console);
}

function findFiles(dirPath) {
	return fs.isDirectory(dirPath)
		.then(function(isDirectory) {
			if(!isDirectory) {
				throw new Error(errors.invalidInputDirectory());
			}
		}).then(function() {
			return fs.list(dirPath);
		});
}

function readFiles(dirPath, filenames) {

	winston.info('Searching for language input files...');

	var promises = [];

	filenames.forEach(function(filePath) {
		promises.push(readFile(dirPath, filePath));
	});

	return Q.all(promises);

}

function readFile(dirPath, filePath) {

	var ext = path.extname(filePath);
	var filename = path.basename(filePath);
	var name = path.basename(filePath, ext);

	if(ext !== '.json') {
		return Q.fcall(function() {
			throw new Error(errors.nonJsonExtension(filename));
		});
	}

	var fullPath = path.join(dirPath, filePath);
	return fs.read(fullPath)
		.then(function(content) {
			var parsedContent = {};
			content = content.trim();
			if(content.length > 0) {
				try {
					parsedContent = JSON.parse(content);
				} catch(e) {
					winston.info('Syntax error parsing JSON in "%s"', filename);
					throw e;
				}
			}
			return {
				name: name,
				content: parsedContent
			};
		});

}

function extract(files) {

	var languages = [];
	var regions = [];

	var langStr = '';
	var langComma = '';
	var regionStr = '';
	var regionComma = '';

	files.forEach(function(file) {
		var subtags = file.name.split('-');
		var langSubtag = subtags[0].toLowerCase();
		if(subtags.length === 1) {
			langStr += langComma + langSubtag;
			langComma = ', ';
			languages[langSubtag] = file.content;
		} else {
			var regionSubtag = subtags[1].toUpperCase();
			regionStr += regionComma + langSubtag + '-' + regionSubtag;
			regionComma = ', ';
			regions.push({
				language: langSubtag,
				region: regionSubtag,
				content: file.content
			});
		}
	});

	winston.info('\tBase languages: ' + langStr);
	winston.info('\tRegion overrides: ' + regionStr);

	return {
		languages: languages,
		regions: regions
	};

}

function merge(obj1, obj2, language, region, objPath) {
	for(var p in obj2) {

		if( objPath.length > 0 ) {
			objPath = objPath + '.';
		}
		objPath = objPath + p;

		if(typeof obj1[p] === 'undefined') {
			throw new Error(
				errors.missingBaseLanguageKey(objPath, language, region)
			);
		}
		if(typeof obj1[p] !== typeof obj2[p]) {
			throw new Error(
				errors.typeMismatch(objPath, language, region)
			);
		}
		if(typeof obj1[p] === 'string') {
			obj1[p] = obj2[p];
		} else if( typeof obj1[p] === 'object') {
			merge(obj1[p], obj2[p], language, region, objPath);
		} else {
			throw new Error(
				errors.invalidDataType(objPath, language)
			);
		}
	}
}

function combine(input) {

	/* TODO: validate that en.json exists and that for every base language file,
	   each term exists that's defined in en.json. Otherwise, warn them and
	   copy the english term into the base langauge. */

	winston.info('Merging region overrides with base languages...');

	input.regions.forEach(function(region) {

		var lang = input.languages[region.language];
		if(!lang) {
			throw new Error(
				errors.missingBaseLanguage(region.language,region.region)
			);
		}

		var newObj = JSON.parse(JSON.stringify(lang));
		merge(newObj, region.content, region.language, region.region, '');
		region.content = newObj;

		winston.info(
			'\t%s-%s merged with %s',
			region.language,
			region.region,
			region.language
		);

	});

	return input.regions;

}

function writeFiles(output, regions) {
	return fs.exists(output)
	 	.then(function(exists) {
			if(exists) {
				return fs.stat(output)
					.then(function(stat) {
						if(stat.isFile()) {
							throw new Error(errors.invalidOutputDirectory());
						}
						return fs.removeTree(output);
					});
			}
		}).then(function() {
			return fs.makeDirectory(output);
		}).then(function() {

			winston.info('Writing to output directory...');

			var promises = [];

			regions.forEach(function(region) {
				promises.push(writeFile(output,region));
			});

			return Q.all(promises);

		});

}

function writeFile(output,region) {

	var filename = region.language + '-' + region.region + '.json';
	var p = path.join(output,filename);
	var content = JSON.stringify(region.content, null, '\t');

	winston.info('\t%s', filename);

	return fs.write(p, content);

}

module.exports = function(dirPath, output, cb) {
	findFiles(dirPath)
		.then(function(filenames) {
			return readFiles(dirPath, filenames);
		})
		.then(extract)
		.then(combine)
		.then(function(regions) {
			return writeFiles(output, regions);
		})
		.then(function() {
			winston.info('Done!');
			cb(null);
		}).fail(function(error) {
			cb(error);
		});
};
module.exports._combine = combine;
module.exports._extract = extract;
module.exports._findFiles = findFiles;
module.exports._merge = merge;
module.exports._readFiles = readFiles;
module.exports._readFile = readFile;
module.exports._writeFiles = writeFiles;
module.exports._writeFile = writeFile;
