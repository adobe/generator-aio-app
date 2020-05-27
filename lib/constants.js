module.exports = {
  webAssetsDirname: 'web-src',
  actionsDirname: 'actions',
  dotenvFilename: '.env',
  manifestPackagePlaceholder: '__APP_PACKAGE__',
  sdkCodes: {
    analytics: 'AdobeAnalyticsSDK',
    target: 'AdobeTargetSDK',
    campaign: 'CampaignSDK',
    customerProfile: 'McDataServicesSdk',
    audienceManagerCD: 'AudienceManagerCustomerSDK'
  },
  ciDirName: '.github',
  commonDependencyVersions: {
    '@adobe/aio-sdk': '^2.3.0'
  }
}
