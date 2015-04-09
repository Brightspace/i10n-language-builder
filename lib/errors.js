'use strict';

var util = require('util');

module.exports.invalidDataType = function(objPath, filename) {
	return util.format(
		'Invalid value data type for key "%s" in file "%s.json"',
		objPath,
		filename
	);
};

module.exports.invalidInputDirectory = function() {
	return 'Invalid input: not a directory';
};

module.exports.invalidOutputDirectory = function() {
	return 'Invalid output: not a directory';
};

module.exports.missingBaseLanguage = function(language, region) {
	return util.format(
		'Missing base language file "%s" for region "%s-%s"',
		language,
		language,
		region
	);
};

module.exports.missingBaseLanguageKey = function(objPath, base, override) {
	return util.format(
		'Key "%s" not found in base "%s" but specified in override "%s"',
		objPath,
		base,
		override
	);
};

module.exports.missingOverrideLanguageKey = function(objPath, fallback, language) {
	return util.format(
		'Key "%s" not found in base language "%s" but specified in fallback "%s"',
		objPath,
		language,
		fallback
	);
};

module.exports.missingFallback = function(fallback) {
	return util.format(
		'Fallback language file "%s.json" is missing"',
		fallback
	);
};

module.exports.nonJsonExtension = function(filename) {
	return util.format('Unexpected non-JSON extension: "%s"', filename);
};

module.exports.typeMismatch = function(objPath, base, override) {
	return util.format(
		'Type mismatch for key "%s" merging "%s" and "%s"',
		objPath,
		base,
		override
	);
};
