import type { ApiMethod, QueryValue } from "@/lib/api/client";
import type { MarketsOperationId } from "@/lib/api/contracts";
import type { ApiRecord } from "@/lib/api/types";

export type ResourceColumn = { key: string; label: string; priority?: "primary" | "normal" };
export type ResourceFilter = { key: string; label: string; placeholder?: string };
export type MutationDefinition = {
  label: string;
  operationId: MarketsOperationId;
  method: ApiMethod;
  path: (uid: string) => string;
  description: string;
  template?: ApiRecord;
  destructive?: boolean;
};
export type DetailSectionDefinition = {
  title: string;
  operationId: MarketsOperationId;
  path: (uid: string) => string;
};

export type ResourceDefinition = {
  id: string;
  title: string;
  singular: string;
  description: string;
  section: "assets" | "portfolios" | "accounts" | "pricing" | "platform";
  listPath: string;
  listOperationId: MarketsOperationId;
  listRoute: string;
  detailRoute?: string;
  detailPath?: (uid: string) => string;
  detailOperationId?: MarketsOperationId;
  columns: ResourceColumn[];
  filters?: ResourceFilter[];
  searchable?: boolean;
  defaultQuery?: Record<string, QueryValue>;
  create?: MutationDefinition;
  update?: MutationDefinition;
  remove?: MutationDefinition;
  bulkActionsPath?: string;
  details?: DetailSectionDefinition[];
  actions?: MutationDefinition[];
};

const jsonResponse = { response_format: "json" } as const;

export const assetsDefinition: ResourceDefinition = {
  id: "assets",
  title: "Assets",
  singular: "asset",
  description: "Browse the canonical asset registry and inspect pricing and metadata relationships.",
  section: "assets",
  listPath: "/api/v1/asset/",
  listOperationId: "listAssets",
  listRoute: "/assets",
  detailRoute: "/assets/:uid",
  detailPath: (uid) => `/api/v1/asset/${uid}/`,
  detailOperationId: "getAsset",
  defaultQuery: jsonResponse,
  filters: [{ key: "categories__uid", label: "Category UID", placeholder: "Exact category UID" }],
  columns: [
    { key: "unique_identifier", label: "Identifier", priority: "primary" },
    { key: "asset_type", label: "Asset type" },
    { key: "uid", label: "UID" },
  ],
  remove: {
    label: "Delete asset",
    operationId: "deleteAsset",
    method: "DELETE",
    path: (uid) => `/api/v1/asset/${uid}/`,
    description: "Delete the selected asset registry record.",
    destructive: true,
  },
  details: [
    { title: "Summary", operationId: "getAssetSummary", path: (uid) => `/api/v1/asset/${uid}/summary/` },
    { title: "Pricing details", operationId: "getAssetPricingDetails", path: (uid) => `/api/v1/asset/${uid}/get_pricing_details/` },
    { title: "Related MetaTables", operationId: "listAssetRelatedMetaTables", path: (uid) => `/api/v1/asset/${uid}/related-meta-tables/` },
  ],
};

export const assetCategoriesDefinition: ResourceDefinition = {
  id: "asset-categories",
  title: "Asset Categories",
  singular: "asset category",
  description: "Maintain the taxonomy used to group assets across Markets workflows.",
  section: "assets",
  listPath: "/api/v1/asset-category/",
  listOperationId: "listAssetCategories",
  listRoute: "/asset-categories",
  detailRoute: "/asset-categories/:uid",
  detailPath: (uid) => `/api/v1/asset-category/${uid}/`,
  detailOperationId: "getAssetCategoryDetail",
  defaultQuery: jsonResponse,
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "description", label: "Description" },
    { key: "uid", label: "UID" },
  ],
  create: {
    label: "Create category",
    operationId: "createAssetCategory",
    method: "POST",
    path: () => "/api/v1/asset-category/",
    description: "Create an asset category using the current OpenAPI request contract.",
    template: { display_name: "", description: "", unique_identifier: "", assets: [] },
  },
  update: {
    label: "Edit category",
    operationId: "updateAssetCategory",
    method: "PATCH",
    path: (uid) => `/api/v1/asset-category/${uid}/`,
    description: "Update display fields or the category's asset membership.",
    template: { display_name: "", description: "", assets: [] },
  },
  remove: {
    label: "Delete category",
    operationId: "deleteAssetCategory",
    method: "DELETE",
    path: (uid) => `/api/v1/asset-category/${uid}/`,
    description: "Delete this asset category.",
    destructive: true,
  },
  bulkActionsPath: "/api/v1/asset-category/bulk-actions/",
};

export const indicesDefinition: ResourceDefinition = {
  id: "indices",
  title: "Indices",
  singular: "index",
  description: "Inspect index definitions, formulas, canonical datasets, and deletion impact.",
  section: "assets",
  listPath: "/api/v1/index/",
  listOperationId: "listIndexes",
  listRoute: "/indices",
  detailRoute: "/indices/:uid",
  detailPath: (uid) => `/api/v1/index/${uid}/`,
  detailOperationId: "getIndex",
  defaultQuery: jsonResponse,
  filters: [{ key: "index_type", label: "Index type", placeholder: "Exact type" }],
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "index_type", label: "Type" },
    { key: "calculation_method", label: "Calculation" },
    { key: "uid", label: "UID" },
  ],
  create: {
    label: "Create index",
    operationId: "createIndex",
    method: "POST",
    path: () => "/api/v1/index/",
    description: "Create an index registry definition.",
    template: {
      unique_identifier: "",
      index_type: "",
      display_name: "",
      calculation_method: "",
      value_format: "number",
      description: "",
      metadata_json: {},
    },
  },
  update: {
    label: "Edit index",
    operationId: "updateIndex",
    method: "PATCH",
    path: (uid) => `/api/v1/index/${uid}/`,
    description: "Update mutable index registry fields.",
    template: { display_name: "", description: "", metadata_json: {} },
  },
  remove: {
    label: "Delete index",
    operationId: "deleteIndex",
    method: "DELETE",
    path: (uid) => `/api/v1/index/${uid}/`,
    description: "Delete this index after reviewing its deletion impact.",
    destructive: true,
  },
  details: [
    { title: "Summary", operationId: "getIndexSummary", path: (uid) => `/api/v1/index/${uid}/summary/` },
    { title: "Formulas", operationId: "listIndexFormulas", path: (uid) => `/api/v1/index/${uid}/formulas/` },
    { title: "Datasets", operationId: "listIndexDatasets", path: (uid) => `/api/v1/index/${uid}/datasets/` },
    { title: "Related MetaTables", operationId: "listIndexRelatedMetaTables", path: (uid) => `/api/v1/index/${uid}/related-meta-tables/` },
    { title: "Delete impact", operationId: "getIndexDeleteImpact", path: (uid) => `/api/v1/index/${uid}/delete-impact/` },
  ],
};

export const calendarsDefinition: ResourceDefinition = {
  id: "calendars",
  title: "Calendars",
  singular: "calendar",
  description: "Manage calendar identities, trading dates, sessions, and market events.",
  section: "platform",
  listPath: "/api/v1/calendar/",
  listOperationId: "listCalendars",
  listRoute: "/calendars",
  detailRoute: "/calendars/:uid",
  detailPath: (uid) => `/api/v1/calendar/${uid}/`,
  detailOperationId: "getCalendar",
  defaultQuery: jsonResponse,
  filters: [
    { key: "calendar_type", label: "Calendar type", placeholder: "Exact type" },
    { key: "source", label: "Source", placeholder: "Exact source" },
  ],
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "calendar_type", label: "Type" },
    { key: "timezone", label: "Timezone" },
    { key: "source", label: "Source" },
  ],
  create: {
    label: "Create calendar",
    operationId: "createCalendar",
    method: "POST",
    path: () => "/api/v1/calendar/",
    description: "Create a calendar identity row.",
    template: {
      unique_identifier: "",
      display_name: "",
      calendar_type: "exchange",
      timezone: "UTC",
      valid_from: "2026-01-01",
      valid_to: "2026-12-31",
      metadata_json: {},
    },
  },
  update: {
    label: "Edit calendar",
    operationId: "updateCalendar",
    method: "PATCH",
    path: (uid) => `/api/v1/calendar/${uid}/`,
    description: "Update mutable calendar fields.",
    template: { display_name: "", timezone: "UTC", metadata_json: {} },
  },
  remove: {
    label: "Delete calendar",
    operationId: "deleteCalendar",
    method: "DELETE",
    path: (uid) => `/api/v1/calendar/${uid}/`,
    description: "Delete this calendar.",
    destructive: true,
  },
  details: [
    { title: "Summary", operationId: "getCalendarSummary", path: (uid) => `/api/v1/calendar/${uid}/summary/` },
    { title: "Dates", operationId: "listCalendarDates", path: (uid) => `/api/v1/calendar/${uid}/dates/` },
    { title: "Sessions", operationId: "listCalendarSessions", path: (uid) => `/api/v1/calendar/${uid}/sessions/` },
    { title: "Events", operationId: "listCalendarEvents", path: (uid) => `/api/v1/calendar/${uid}/events/` },
  ],
  actions: [
    {
      label: "Add date",
      operationId: "createCalendarDate",
      method: "POST",
      path: (uid) => `/api/v1/calendar/${uid}/dates/`,
      description: "Create one calendar date record.",
      template: { date: "2026-01-01", is_business_day: true, metadata_json: {} },
    },
    {
      label: "Add session",
      operationId: "createCalendarSession",
      method: "POST",
      path: (uid) => `/api/v1/calendar/${uid}/sessions/`,
      description: "Create one calendar session record.",
      template: { session_date: "2026-01-01", open_time: "09:00:00", close_time: "17:00:00" },
    },
    {
      label: "Add event",
      operationId: "createCalendarEvent",
      method: "POST",
      path: (uid) => `/api/v1/calendar/${uid}/events/`,
      description: "Create one calendar event record.",
      template: { event_date: "2026-01-01", event_type: "holiday", display_name: "" },
    },
  ],
};

export const portfoliosDefinition: ResourceDefinition = {
  id: "portfolios",
  title: "Portfolios",
  singular: "portfolio",
  description: "Browse target portfolios, weights, signals, values, and linked resources.",
  section: "portfolios",
  listPath: "/api/v1/portfolio/",
  listOperationId: "listPortfolios",
  listRoute: "/portfolios",
  detailRoute: "/portfolios/:uid",
  detailPath: (uid) => `/api/v1/portfolio/${uid}/`,
  detailOperationId: "getPortfolio",
  defaultQuery: jsonResponse,
  filters: [{ key: "calendar_uid", label: "Calendar UID", placeholder: "Exact calendar UID" }],
  columns: [
    { key: "unique_identifier", label: "Identifier", priority: "primary" },
    { key: "calendar_uid", label: "Calendar" },
    { key: "published_index_uid", label: "Published index" },
    { key: "signal_uid", label: "Signal" },
    { key: "uid", label: "UID" },
  ],
  remove: {
    label: "Delete portfolio",
    operationId: "deletePortfolio",
    method: "DELETE",
    path: (uid) => `/api/v1/portfolio/${uid}/`,
    description: "Delete this portfolio registry record.",
    destructive: true,
  },
  bulkActionsPath: "/api/v1/portfolio/bulk-actions/",
  details: [
    { title: "Summary", operationId: "getPortfolioSummary", path: (uid) => `/api/v1/portfolio/${uid}/summary/` },
    { title: "Weights", operationId: "getPortfolioWeights", path: (uid) => `/api/v1/portfolio/${uid}/weights/` },
    { title: "Signal weights", operationId: "getPortfolioSignalWeightsFrame", path: (uid) => `/api/v1/portfolio/${uid}/signals_weights/` },
    { title: "Portfolio values", operationId: "getPortfolioValuesFrame", path: (uid) => `/api/v1/portfolio/${uid}/portfolio_values/` },
  ],
  actions: [
    {
      label: "Delete weights",
      operationId: "deletePortfolioWeights",
      method: "DELETE",
      path: (uid) => `/api/v1/portfolio/${uid}/weights/`,
      description: "Delete the portfolio's persisted weights.",
      destructive: true,
    },
  ],
};

export const portfolioGroupsDefinition: ResourceDefinition = {
  id: "portfolio-groups",
  title: "Portfolio Groups",
  singular: "portfolio group",
  description: "Organize portfolios into stable reusable groups.",
  section: "portfolios",
  listPath: "/api/v1/portfolio-group/",
  listOperationId: "listPortfolioGroups",
  listRoute: "/portfolio-groups",
  detailRoute: "/portfolio-groups/:uid",
  detailPath: (uid) => `/api/v1/portfolio-group/${uid}/`,
  detailOperationId: "getPortfolioGroup",
  defaultQuery: jsonResponse,
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "description", label: "Description" },
    { key: "uid", label: "UID" },
  ],
  create: {
    label: "Create group",
    operationId: "createPortfolioGroup",
    method: "POST",
    path: () => "/api/v1/portfolio-group/",
    description: "Create or upsert a portfolio group.",
    template: { unique_identifier: "", display_name: "", description: "", metadata_json: {} },
  },
  update: {
    label: "Edit group",
    operationId: "updatePortfolioGroup",
    method: "PATCH",
    path: (uid) => `/api/v1/portfolio-group/${uid}/`,
    description: "Update mutable portfolio group fields.",
    template: { display_name: "", description: "", metadata_json: {} },
  },
  remove: {
    label: "Delete group",
    operationId: "deletePortfolioGroup",
    method: "DELETE",
    path: (uid) => `/api/v1/portfolio-group/${uid}/`,
    description: "Delete this portfolio group.",
    destructive: true,
  },
  bulkActionsPath: "/api/v1/portfolio-group/bulk-actions/",
  details: [
    { title: "Portfolios", operationId: "listPortfoliosInGroup", path: (uid) => `/api/v1/portfolio-group/${uid}/portfolios/` },
  ],
  actions: [
    {
      label: "Add portfolio",
      operationId: "addPortfolioToGroup",
      method: "POST",
      path: (uid) => `/api/v1/portfolio-group/${uid}/portfolios/`,
      description: "Add a portfolio to this group by UID or unique identifier.",
      template: { portfolio_uid: "", portfolio_unique_identifier: "" },
    },
  ],
};

export const portfolioSignalsDefinition: ResourceDefinition = {
  id: "portfolio-signals",
  title: "Portfolio Signals",
  singular: "portfolio signal",
  description: "Maintain signal metadata and safely remove generated signal weights.",
  section: "portfolios",
  listPath: "/api/v1/portfolio-signal/",
  listOperationId: "listPortfolioSignals",
  listRoute: "/portfolio-signals",
  detailRoute: "/portfolio-signals/:uid",
  detailPath: (uid) => `/api/v1/portfolio-signal/${uid}/`,
  detailOperationId: "getPortfolioSignal",
  filters: [{ key: "signal_uid", label: "Signal UID", placeholder: "Exact signal UID" }],
  columns: [
    { key: "signal_description", label: "Description", priority: "primary" },
    { key: "signal_uid", label: "Signal UID" },
    { key: "uid", label: "Metadata UID" },
  ],
  create: {
    label: "Create signal",
    operationId: "createPortfolioSignal",
    method: "POST",
    path: () => "/api/v1/portfolio-signal/",
    description: "Create portfolio signal metadata.",
    template: { signal_uid: "", signal_description: "" },
  },
  update: {
    label: "Edit description",
    operationId: "updatePortfolioSignal",
    method: "PATCH",
    path: (uid) => `/api/v1/portfolio-signal/${uid}/`,
    description: "Update the signal description.",
    template: { signal_description: "" },
  },
  remove: {
    label: "Delete signal",
    operationId: "deletePortfolioSignal",
    method: "DELETE",
    path: (uid) => `/api/v1/portfolio-signal/${uid}/`,
    description: "Delete signal metadata and associated signal records.",
    destructive: true,
  },
  actions: [
    {
      label: "Delete weights",
      operationId: "deletePortfolioSignalWeights",
      method: "DELETE",
      path: (uid) => `/api/v1/portfolio-signal/${uid}/weights/`,
      description: "Delete values generated for this signal.",
      destructive: true,
    },
  ],
};

export const accountsDefinition: ResourceDefinition = {
  id: "accounts",
  title: "Accounts",
  singular: "account",
  description: "Review managed account state, holdings, fund allocation, and target positions.",
  section: "accounts",
  listPath: "/api/v1/account/",
  listOperationId: "listAccounts",
  listRoute: "/accounts",
  detailRoute: "/accounts/:uid",
  detailPath: (uid) => `/api/v1/account/${uid}/summary/`,
  detailOperationId: "getAccountSummary",
  columns: [
    { key: "account_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "account_is_active", label: "Active" },
    { key: "is_paper", label: "Paper" },
    { key: "uid", label: "UID" },
  ],
  details: [
    { title: "Holdings", operationId: "getAccountHoldings", path: (uid) => `/api/v1/account/${uid}/holdings/` },
    { title: "Holdings by fund", operationId: "getAccountHoldingsByFund", path: (uid) => `/api/v1/account/${uid}/holdings/by-fund/` },
    { title: "Target positions", operationId: "getAccountTargetPositions", path: (uid) => `/api/v1/account/${uid}/target-positions/` },
  ],
  actions: [
    {
      label: "Add holdings",
      operationId: "addAccountHoldings",
      method: "POST",
      path: (uid) => `/api/v1/account/${uid}/add-holdings/`,
      description: "Add or overwrite an account holdings snapshot.",
      template: { holdings_date: "2026-01-01", overwrite: false, positions: [] },
    },
    {
      label: "Add target positions",
      operationId: "addAccountTargetPositions",
      method: "POST",
      path: (uid) => `/api/v1/account/${uid}/add-target-positions/`,
      description: "Add or overwrite an account target-position snapshot.",
      template: { target_positions_date: "2026-01-01", overwrite: false, positions: [] },
    },
  ],
};

export const virtualFundsDefinition: ResourceDefinition = {
  id: "virtual-funds",
  title: "Virtual Funds",
  singular: "virtual fund",
  description: "Inspect virtual funds, source accounts, target portfolios, and latest holdings.",
  section: "accounts",
  listPath: "/api/v1/virtualfund/",
  listOperationId: "listVirtualFunds",
  listRoute: "/virtual-funds",
  detailRoute: "/virtual-funds/:uid",
  detailPath: (uid) => `/api/v1/virtualfund/${uid}/`,
  detailOperationId: "getVirtualFund",
  defaultQuery: jsonResponse,
  filters: [
    { key: "account_uid", label: "Account UID", placeholder: "Exact account UID" },
    { key: "portfolio_uid", label: "Portfolio UID", placeholder: "Exact portfolio UID" },
  ],
  columns: [
    { key: "unique_identifier", label: "Identifier", priority: "primary" },
    { key: "account_uid", label: "Account" },
    { key: "target_portfolio_uid", label: "Target portfolio" },
    { key: "uid", label: "UID" },
  ],
  details: [
    { title: "Summary", operationId: "getVirtualFundSummary", path: (uid) => `/api/v1/virtualfund/${uid}/summary/` },
    { title: "Holdings", operationId: "getVirtualFundHoldings", path: (uid) => `/api/v1/virtualfund/${uid}/holdings/` },
  ],
};

export const pricingCurvesDefinition: ResourceDefinition = {
  id: "pricing-curves",
  title: "Pricing Curves",
  singular: "pricing curve",
  description: "Browse pricing curves, resolve market-data selections, and inspect discount-curve inputs.",
  section: "pricing",
  listPath: "/api/v1/pricing/curves/",
  listOperationId: "listPricingCurves",
  listRoute: "/pricing-curves",
  detailRoute: "/pricing-curves/:uid",
  detailPath: (uid) => `/api/v1/pricing/curves/${uid}/summary/`,
  detailOperationId: "getPricingCurveSummary",
  filters: [
    { key: "curve_type", label: "Curve type", placeholder: "Exact type" },
    { key: "source", label: "Source", placeholder: "Exact source" },
  ],
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "unique_identifier", label: "Identifier" },
    { key: "curve_type", label: "Curve type" },
    { key: "currency_code", label: "Currency" },
    { key: "status", label: "Status" },
    { key: "uid", label: "UID" },
  ],
  remove: {
    label: "Delete curve",
    operationId: "deletePricingCurve",
    method: "DELETE",
    path: (uid) => `/api/v1/pricing/curves/${uid}/`,
    description: "Delete this pricing curve after reviewing its impact.",
    destructive: true,
  },
  details: [
    { title: "Selections", operationId: "listPricingCurveSelections", path: (uid) => `/api/v1/pricing/curves/${uid}/curve-selections/` },
    { title: "Delete impact", operationId: "getPricingCurveDeleteImpact", path: (uid) => `/api/v1/pricing/curves/${uid}/delete-impact/` },
  ],
  actions: [
    {
      label: "Load discount curve",
      operationId: "getPricingDiscountCurve",
      method: "GET",
      path: (uid) => `/api/v1/pricing/curves/${uid}/discount-curve/`,
      description: "Resolve discount-curve nodes for a valuation date and optional market-data set.",
      template: { valuation_date: "2026-01-01", market_data_set_uid: "" },
    },
  ],
};

export const marketDataSetsDefinition: ResourceDefinition = {
  id: "pricing-market-data-sets",
  title: "Market Data Sets",
  singular: "market data set",
  description: "Manage named pricing market-data environments and their lifecycle status.",
  section: "pricing",
  listPath: "/api/v1/pricing/market_data/sets/",
  listOperationId: "listPricingMarketDataSets",
  listRoute: "/pricing-market-data/sets",
  detailRoute: "/pricing-market-data/sets/:uid",
  detailPath: (uid) => `/api/v1/pricing/market_data/sets/${uid}/`,
  detailOperationId: "getPricingMarketDataSet",
  filters: [
    { key: "set_key", label: "Set key", placeholder: "Exact key" },
    { key: "status", label: "Status", placeholder: "Exact status" },
  ],
  searchable: false,
  columns: [
    { key: "display_name", label: "Name", priority: "primary" },
    { key: "set_key", label: "Set key" },
    { key: "status", label: "Status" },
    { key: "description", label: "Description" },
    { key: "uid", label: "UID" },
  ],
  create: {
    label: "Create data set",
    operationId: "createPricingMarketDataSet",
    method: "POST",
    path: () => "/api/v1/pricing/market_data/sets/",
    description: "Create a pricing market-data set.",
    template: { set_key: "", display_name: "", description: "", status: "active", metadata_json: {} },
  },
  update: {
    label: "Edit data set",
    operationId: "updatePricingMarketDataSet",
    method: "PATCH",
    path: (uid) => `/api/v1/pricing/market_data/sets/${uid}/`,
    description: "Update mutable pricing market-data set fields.",
    template: { display_name: "", description: "", status: "active", metadata_json: {} },
  },
  remove: {
    label: "Delete data set",
    operationId: "deletePricingMarketDataSet",
    method: "DELETE",
    path: (uid) => `/api/v1/pricing/market_data/sets/${uid}/`,
    description: "Delete this pricing market-data set.",
    destructive: true,
  },
  details: [
    { title: "Bindings", operationId: "listPricingMarketDataSetBindings", path: (uid) => `/api/v1/pricing/market_data/sets/${uid}/bindings/` },
  ],
};

export const marketDataBindingsDefinition: ResourceDefinition = {
  id: "pricing-market-data-bindings",
  title: "Market Data Bindings",
  singular: "market data binding",
  description: "Bind pricing concepts to governed DataNode or storage-table sources.",
  section: "pricing",
  listPath: "/api/v1/pricing/market_data/bindings/",
  listOperationId: "listPricingMarketDataBindings",
  listRoute: "/pricing-market-data/bindings",
  detailRoute: "/pricing-market-data/bindings/:uid",
  detailPath: (uid) => `/api/v1/pricing/market_data/bindings/${uid}/`,
  detailOperationId: "getPricingMarketDataBinding",
  filters: [
    { key: "market_data_set_uid", label: "Set UID", placeholder: "Exact set UID" },
    { key: "concept_key", label: "Concept key", placeholder: "Exact concept key" },
  ],
  searchable: false,
  columns: [
    { key: "concept_key", label: "Concept", priority: "primary" },
    { key: "market_data_set_uid", label: "Set UID" },
    { key: "source", label: "Source" },
    { key: "data_node_uid", label: "DataNode" },
    { key: "uid", label: "UID" },
  ],
  create: {
    label: "Create binding",
    operationId: "createPricingMarketDataBinding",
    method: "POST",
    path: () => "/api/v1/pricing/market_data/bindings/",
    description: "Create a pricing concept binding.",
    template: { market_data_set_uid: "", concept_key: "", data_node_uid: "", source: "data_node", metadata_json: {} },
  },
  update: {
    label: "Edit binding",
    operationId: "updatePricingMarketDataBinding",
    method: "PATCH",
    path: (uid) => `/api/v1/pricing/market_data/bindings/${uid}/`,
    description: "Update the source behind a pricing concept binding.",
    template: { data_node_uid: "", source: "data_node", metadata_json: {} },
  },
  remove: {
    label: "Delete binding",
    operationId: "deletePricingMarketDataBinding",
    method: "DELETE",
    path: (uid) => `/api/v1/pricing/market_data/bindings/${uid}/`,
    description: "Delete this pricing market-data binding.",
    destructive: true,
  },
};

export const resourceDefinitions = [
  assetCategoriesDefinition,
  assetsDefinition,
  indicesDefinition,
  portfoliosDefinition,
  portfolioGroupsDefinition,
  portfolioSignalsDefinition,
  accountsDefinition,
  virtualFundsDefinition,
  pricingCurvesDefinition,
  marketDataSetsDefinition,
  marketDataBindingsDefinition,
  calendarsDefinition,
] as const;
