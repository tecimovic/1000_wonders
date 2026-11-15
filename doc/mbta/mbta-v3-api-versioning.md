<!-- Source: https://www.mbta.com/developers/v3-api/versioning — downloaded 2026-11-15, converted to Markdown -->

# Versioning

As we introduce improvements and fixes to the V3 API, we try to ensure that changes are backward compatible. If we introduce a backward-incompatible change, we label it with a new version. Previous V3 API versions remain available and can be invoked using their own labels. The version labels are formatted as dates, for example, "2021-01-09."

V3 API keys are associated with a specific version, which controls the API behavior. If you do not [change the version](#upgrade), the API will behave the same way, and any backward-incompatible changes will not affect your application.

- Newly created API keys default to the current version at the time they are created. You can check what version your key is using via the [V3 API Portal](https://api-v3.mbta.com/portal).
- Anonymous access without an API key defaults to the latest version. It can be overridden with the `MBTA-Version` header.

&nbsp;

## Backward-Compatible Changes

The following changes do not result in a new release:

- New resources
- New attributes on existing resources
- New relationships for existing resources
- New filters for existing resources
- Reordering fields or values
- Changing the format or value of IDs
  - Trip IDs can be changed at any time.
  - IDs will always be strings.

## Upgrade to a New Version

To upgrade to a new V3 API version:

1.  Update your code to work with both the old and new versions.
2.  Do one of the following:
    - Edit your API key version via the [V3 API Portal](https://api-v3.mbta.com/portal).
    - Specify the `MBTA-Version` header with each request, for example, `MBTA-Version: 2021-01-09`.

## Keep Up to Date

New releases are posted to the [MBTA Developers Google Group](https://groups.google.com/forum/#!forum/massdotdevelopers). Subscribe to be notified about updates.

The [V3 API Documentation](https://api-v3.mbta.com/docs/swagger/) reflects the latest version.

For backward-incompatible changes, read the [Changelog](/developers/v3-api/changelog).

## Experimental Features

"Experimental" V3 API data or features may change or be removed without prior notice. These are noted in the [V3 API Documentation](https://api-v3.mbta.com/docs/swagger/index.html). To opt in to use these features, a request must include the `x-enable-experimental-features: true` header.

