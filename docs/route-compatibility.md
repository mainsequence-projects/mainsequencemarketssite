# Route compatibility

| Site route | Primary operation | Important related operations |
| --- | --- | --- |
| `/asset-categories` | `listAssetCategories` | create, detail, patch, delete, discovered bulk delete |
| `/assets` | `listAssets` | detail, summary, pricing details, related MetaTables, delete |
| `/indices` | `listIndexes` | detail, summary, formulas, datasets, delete impact, patch/delete |
| `/portfolios` | `listPortfolios` | detail, summary, weights, signal weights, values, discovered bulk delete |
| `/portfolio-groups` | `listPortfolioGroups` | detail, members, add member, patch/delete, discovered bulk delete |
| `/portfolio-signals` | `listPortfolioSignals` | detail, create, patch, delete weights, delete metadata |
| `/accounts` | `listAccounts` | summary, holdings, holdings by fund, target positions, add snapshots |
| `/virtual-funds` | `listVirtualFunds` | detail, summary, holdings |
| `/pricing-curves` | `listPricingCurves` | summary, selections, discount curve, delete impact/delete |
| `/pricing-market-data` | `getPricingMarketDataCard` | set and binding registries |
| `/pricing-market-data/sets` | `listPricingMarketDataSets` | create, detail, patch/delete, set bindings |
| `/pricing-market-data/bindings` | `listPricingMarketDataBindings` | create, detail, patch/delete |
| `/calendars` | `listCalendars` | detail, summary, dates, sessions, events, create/patch/delete |
| `/settings` | `getApiSettings` | Markets API Diagnostics, OpenAPI, and Adapter discovery links |

Stable detail routes use `/:uid` under the corresponding list route.

## Deliberate exclusions and gaps

- Instruments configuration is excluded because `/api/v1/instruments-configuration/current/` is
  not present in the pinned OpenAPI contract.
- Account deletion is not exposed because the pinned contract has no account DELETE operation.
- Authentication and authorization come from the browser gateway, not persisted frontend state.
- The three bulk-action discovery/preflight contracts are frontend-ready but require the coordinated
  backend release described in the API contract document.
- Active saved widget-workspace compatibility belongs to the independent widget-package cutover and
  is not proven by the site implementation.
