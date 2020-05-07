module.exports = {
  webAssetsDirname: 'web-src',
  actionsDirname: 'actions',
  eventsDirname: 'events',
  dotenvFilename: '.env',
  manifestPackagePlaceholder: '__APP_PACKAGE__',
  sdkCodes: {
    analytics: 'AdobeAnalyticsSDK',
    target: 'AdobeTargetSDK',
    campaign: 'CampaignSDK',
    customerProfile: 'McDataServicesSdk'
  },
  eventCodes: {
    webhook: 'WebhookConsumer',
    journal: 'JournalConsumer',
    customEvents: 'CustomEventsProducer'
  },
  ciDirName: '.github',
  commonDependencyVersions: {
    '@adobe/aio-sdk': '^2.1.0'
  }
}
