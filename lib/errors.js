'use strict';

var util = require('util');

module.exports.invalidInputDirectory = function() {
	return 'Invalid input: not a directory';
};

module.exports.invalidDataType = function(objPath, language) {
	return util.format(
		'Invalid value data type for key "%s" in base language "%s"',
		objPath,
		language
	);
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

module.exports.missingBaseLanguageKey = function(objPath, language, region) {
	return util.format(
		'Key "%s" not found in base language "%s" but specified in region "%s"',
		objPath,
		language,
		region
	);
};

module.exports.nonJsonExtension = function(filename) {
	return util.format('Unexpected non-JSON extension: "%s"', filename);
};

module.exports.typeMismatch = function(objPath, language, region) {
	return util.format(
		'Type mismatch for key "%s" between base language "%s" and region "%s"',
		objPath,
		language,
		region
	);
};
