'use strict'; 

const { worker } = require('@adobe/asset-compute-sdk');
const { SourceUnsupportedError } = require('@adobe/asset-compute-sdk/errors');
const fs = require('fs').promises;

exports.main = worker(async (source, rendition) => {
    // Check for unsupported file
    const stats = await fs.stat(source.path);
    if (stats.size === 0) {
        throw new SourceUnsupportedError('source file is unsupported');
    }
    // process infile and write to outfile
    // parameters are in rendition.instructions
    await fs.copyFile(source.path, rendition.path);
});