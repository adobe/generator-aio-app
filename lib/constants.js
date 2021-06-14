module.exports = {
  isLoopingPrompts: false,
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
    '@adobe/aio-sdk': '^3.0.0'
  },
  appConfigFile: 'app.config.yaml',
  runtimeManifestKey: 'runtimeManifest'
}
