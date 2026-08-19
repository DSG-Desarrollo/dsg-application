// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const aliases = {
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@i18n': path.resolve(__dirname, 'src/i18n'),
  '@helpers': path.resolve(__dirname, 'src/helpers'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@styles': path.resolve(__dirname, 'src/styles'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@context': path.resolve(__dirname, 'src/context'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (moduleName === alias || moduleName.startsWith(alias + '/')) {
      const rest = moduleName.slice(alias.length);
      return context.resolveRequest(context, path.join(aliasPath, rest), platform);
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;