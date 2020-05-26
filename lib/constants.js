module.exports = {
  webAssetsDirname: 'web-src',
  actionsDirname: 'actions',
  dotenvFilename: '.env',
  manifestPackagePlaceholder: '__APP_PACKAGE__',
  sdkCodes: {
    analytics: 'AdobeAnalyticsSDK',
    assetCompute: 'AssetComputeSDK',
    campaign: 'CampaignSDK',
    customerProfile: 'McDataServicesSdk',
    target: 'AdobeTargetSDK',
    audienceManagerCD: 'AudienceManagerCustomerSDK'
  },
  ciDirName: '.github',
  commonDependencyVersions: {
    '@adobe/aio-sdk': '^2.2.0'
  }
}
