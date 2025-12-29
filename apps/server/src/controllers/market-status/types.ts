import z from '@nepse-dashboard/zod';

//expected open type
export enum NepseOpenState {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  'Pre Open' = 'Pre Open',
  'Pre Open CLOSE' = 'Pre Open CLOSE',
}

export const NepseOpenStateSchema = z.enum(NepseOpenState);

export enum MappedMarketOpenState {
  OPEN = 'Open',
  CLOSE = 'Close',
  PRE_OPEN = 'Pre Open',
  PRE_CLOSE = 'Pre Close',
}

export type NepseOpenStatus = {
  isOpen: NepseOpenState;
  asOf: string;
  id: number;
};

//then later transform it to
export const NepseOpenStateMap: Record<NepseOpenState, MappedMarketOpenState> =
  {
    [NepseOpenState.CLOSE]: MappedMarketOpenState.CLOSE,
    [NepseOpenState.OPEN]: MappedMarketOpenState.OPEN,
    [NepseOpenState['Pre Open']]: MappedMarketOpenState.PRE_OPEN,
    [NepseOpenState['Pre Open CLOSE']]: MappedMarketOpenState.PRE_CLOSE,
  };

export const MarketStatusResponseSchema = z.object({
  state: z.enum(MappedMarketOpenState), //this is after being mapped from NepseOpenStateMap
  isOpen: z.boolean(),
  version: z.string(),
  asOf: z.string(), // ISO date string`
});

export type MarketStatusResponseType = z.infer<
  typeof MarketStatusResponseSchema
>;
