interface SecurityDetail {
	id: number;
	symbol: string;
	name: string;
	activeStatus: string;
	listingDate: Date;
	closePrice: number;
	businessDate: Date;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	lastTradePrice: number;
}
interface SecurityDetailResponse {
	securityDailyTradeDto: SecurityDailyTradeDto;
	security: Security;
	stockListedShares: number;
	paidUpCapital: number;
	issuedCapital: number;
	marketCapitalization: number;
	publicShares: number;
	publicPercentage: number;
	promoterShares: number;
	promoterPercentage: number;
	updatedDate: Date;
	securityId: number;
}

interface Security {
	id: number;
	symbol: string;
	isin: string;
	permittedToTrade: string;
	listingDate: Date;
	creditRating: null;
	tickSize: number;
	instrumentType: InstrumentType;
	capitalGainBaseDate: Date;
	faceValue: number;
	highRangeDPR: null;
	issuerName: null;
	meInstanceNumber: number;
	parentId: null;
	recordType: number;
	schemeDescription: null;
	schemeName: null;
	secured: null;
	series: null;
	shareGroupId: ShareGroupID;
	activeStatus: string;
	divisor: number;
	cdsStockRefId: number;
	securityName: string;
	tradingStartDate: Date;
	networthBasePrice: number;
	securityTradeCycle: number;
	isPromoter: string;
	companyId: CompanyID;
}

interface CompanyID {
	id: number;
	companyShortName: string;
	companyName: string;
	email: string;
	companyWebsite: string;
	companyContactPerson: string;
	sectorMaster: SectorMaster;
	companyRegistrationNumber: string;
	activeStatus: string;
}

interface SectorMaster {
	id: number;
	sectorDescription: string;
	activeStatus: string;
	regulatoryBody: string;
}

interface InstrumentType {
	id: number;
	code: string;
	description: string;
	activeStatus: string;
}

interface ShareGroupID {
	id: number;
	name: string;
	description: string;
	capitalRangeMin: number;
	modifiedBy: null;
	modifiedDate: null;
	activeStatus: string;
	isDefault: string;
}

interface SecurityDailyTradeDto {
	securityId: string;
	openPrice: number;
	highPrice: number;
	lowPrice: number;
	totalTradeQuantity: number;
	totalTrades: number;
	lastTradedPrice: number;
	previousClose: number;
	businessDate: Date;
	closePrice: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	lastUpdatedDateTime: Date;
}

interface Summary {
	totalTurnoverRs: number;
	totalTradedShares: number;
	totalTransactions: number;
	totalScripsTraded: number;
	totalMarketCapitalizationRs: number;
	totalFloatMarketCapitalizationRs: number;
}

interface TopTradeScrips {
	symbol: string;
	shareTraded: number;
	closingPrice: number;
	securityName: string;
	securityId: number;
}

interface TopTransaction {
	securityId: number;
	totalTrades: number;
	lastTradedPrice: number;
	securityName: string;
	symbol: string;
}

interface TopTurnover {
	symbol: string;
	turnover: number;
	closingPrice: number;
	securityName: string;
	securityId: number;
}

interface TopGainerLoosers {
	symbol: string;
	ltp: number;
	pointChange: number;
	percentageChange: number;
	securityName: string;
	securityId: number;
}

interface IndexData {
	id: number;
	auditId: number | null;
	exchangeIndexId: number | null;
	generatedTime: string | null;
	index: string;
	close: number;
	high: number;
	low: number;
	previousClose: number;
	change: number;
	perChange: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	currentValue: number;
}

interface NepseIndex {
	"Sensitive Float Index": IndexData;
	"Float Index": IndexData;
	"Sensitive Index": IndexData;
	"NEPSE Index": IndexData;
	[key: string]: IndexData;
}

type Timestamp = number;
type IndexValue = number;

type IndexDataPoint = [Timestamp, IndexValue];
type IndexIntradayData = IndexDataPoint[];

interface PriceVolumeItem {
	securityId: number;
	securityName: string;
	symbol: string;
	indexId: number;
	totalTradeQuantity: number;
	lastTradedPrice: number;
	percentageChange: number;
	previousClose: number;
}

type PriceVolume = PriceVolumeItem[];

interface SecurityItem {
	id: number;
	symbol: string;
	securityName: string;
	name: string;
	activeStatus: "A" | "I"; // "A" for active, "I" for inactive, add other possible values if needed
}

type SecurityList = SecurityItem[];

type CompanyStatus = "A" | "D" | "S";

type SectorName =
	| "Commercial Banks"
	| "Hotels And Tourism"
	| "Others"
	| "Hydro Power"
	| "Tradings"
	| "Development Banks"
	| "Microfinance"
	| "Non Life Insurance"
	| "Life Insurance"
	| "Manufacturing And Processing"
	| "Finance"
	| "Investment"
	| "Mutual Fund";

type InstrumentTypes =
	| "Equity"
	| "Mutual Funds"
	| "Preference Shares"
	| "Non-Convertible Debentures";

interface Company {
	id: number;
	companyName: string;
	symbol: string;
	securityName: string;
	status: CompanyStatus;
	companyEmail: string;
	website: string;
	sectorName: SectorName;
	regulatoryBody: string;
	instrumentType: InstrumentTypes;
}

type CompanyList = Company[];

export type {
	IndexDataPoint,
	IndexIntradayData,
	NepseIndex,
	PriceVolume,
	SecurityDetail,
	SecurityDetailResponse,
	SecurityList,
	Summary,
	TopGainerLoosers,
	TopTradeScrips,
	TopTransaction,
	TopTurnover,
	CompanyList,
};
