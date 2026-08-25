// metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const aliases = {
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@core': path.resolve(__dirname, 'src/core'),
  '@i18n': path.resolve(__dirname, 'src/i18n'),
  '@helpers': path.resolve(__dirname, 'src/helpers'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@styles': path.resolve(__dirname, 'src/styles'),
  '@themes': path.resolve(__dirname, 'src/themes'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@context': path.resolve(__dirname, 'src/context'),
  '@routes': path.resolve(__dirname, 'src/data'),
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