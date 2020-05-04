module.exports = {
  webAssetsDirname: 'web-src',
  actionsDirname: 'actions',
  dotenvFilename: '.env',
  manifestPackagePlaceholder: '__APP_PACKAGE__',
  sdkCodes: {
    analytics: 'AdobeAnalyticsSDK',
    assetCompute: 'AssetCompute',
    campaign: 'CampaignSDK',
    customerProfile: 'McDataServicesSdk',
    target: 'AdobeTargetSDK',
  },
  ciDirName: '.github',
  commonDependencyVersions: {
    '@adobe/aio-sdk': '^2.1.0'
  }
}
