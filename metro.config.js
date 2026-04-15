const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add network resilience without breaking ESM compatibility
config.server = {
    ...config.server,
    reloadOnFailure: true,
};

// Reduce worker count for mobile compatibility
config.maxWorkerCount = 2;
