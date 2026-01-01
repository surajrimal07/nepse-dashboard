/** Single WACC item from API response */
export interface WaccApiItem {
	averageBuyRate: number;
	demat: string;
	lastModifiedDate: string;
	scrip: string;
	totalCost: number;
	totalQuantity: number;
}

/** API response from /api/myPurchase/waccReport/ */
export interface WaccApiResponse {
	isWaccPending: boolean;
	message: string;
	viewWaccSummaryReport: boolean;
	waccReportResponse: WaccApiItem[];
}

/** Stored WACC data with sync timestamp, keyed by boid */
export interface StoredWaccData {
	boid: string;
	wacc: WaccApiItem[];
	syncedAt: number;
}

// =============== Portfolio API Types ===============

/** Single portfolio item from API response */
export interface PortfolioApiItem {
	currentBalance: number;
	lastTransactionPrice: string;
	previousClosingPrice: string;
	script: string;
	scriptDesc: string;
	valueAsOfLastTransactionPrice: string;
	valueAsOfPreviousClosingPrice: string;
	valueOfLastTransPrice: number;
	valueOfPrevClosingPrice: number;
}

/** API response from /api/meroShareView/myPortfolio/ */
export interface PortfolioApiResponse {
	meroShareMyPortfolio: PortfolioApiItem[];
	totalItems: number;
	totalValueAsOfLastTransactionPrice: string;
	totalValueAsOfPreviousClosingPrice: string;
	totalValueOfLastTransPrice: number;
	totalValueOfPrevClosingPrice: number;
}

/** Stored portfolio data with sync timestamp, keyed by boid */
export interface StoredPortfolioApiData {
	boid: string;
	portfolio: PortfolioApiItem[];
	totalValueOfLastTransPrice: number;
	totalValueOfPrevClosingPrice: number;
	syncedAt: number;
}

export const prefix = "nepse-dashboard-extension-";

// Portfolio Types
export interface WidgetItem {
	ticker: string;
	amount: number;
	percentage: number;
}

export interface WidgetData {
	today: {
		gain: WidgetItem;
		loss: WidgetItem;
	};
	most: {
		gain: WidgetItem;
		loss: WidgetItem;
	};

	todayTotal: {
		amount: number;
		percentage: number;
	};
	mostTraded: {
		ticker: string;
		count: number;
	};
}

export interface PortfolioStats {
	diff: { total: number; percentage: number };
	overall: { total: number; percentage: number };
	widgetData: WidgetData;
	updatedAt: number; // timestamp
}



export interface RawHoldingTransaction {
  /** Row number (S.N in CSV) */
  "S.N": string;

  /** Stock symbol */
  Scrip: string;

  /** YYYY-MM-DD */
  "Transaction Date": string;

  /** Credit quantity or "-" */
  "Credit Quantity": string;

  /** Debit quantity or "-" */
  "Debit Quantity": string;

  /** Balance after transaction */
  "Balance After Transaction": string;

  /** Free-form description */
  "History Description": string;
}

/**
 * Response from /api/meroShare/ownDetail/ endpoint
 * Contains user's Meroshare account details
 */
export interface ClientDetails {
  address: string;
  boid: string;
  clientCode: string;
  contact: string;
  createdApproveDate: string;
  createdApproveDateStr: string;
  customerTypeCode: string;
  demat: string;
  dematExpiryDate: string;
  email: string;
  expiredDate: string;
  expiredDateStr: string;
  gender: string;
  id: number;
  imagePath: string;
  meroShareEmail: string;
  name: string;
  passwordChangeDate: string;
  passwordChangedDateStr: string;
  passwordExpiryDate: string;
  passwordExpiryDateStr: string;
  profileName: string;
  renderDashboard: boolean;
  renewedDate: string;
  renewedDateStr: string;
  username: string;
}

/**
 * Stored client data - ClientDetails plus sync timestamp
 */
export interface StoredClientData extends ClientDetails {
  syncedAt: number;
}

/**
 * Stored transaction data with sync timestamp, keyed by boid
 */
export interface StoredTransactionData {
  boid: string;
  clientCode: string;
  transactions: RawHoldingTransaction[];
  syncedAt: number;
}