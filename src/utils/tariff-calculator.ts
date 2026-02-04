export enum TariffFlag {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED_1 = 'RED_1',
  RED_2 = 'RED_2',
}

export const TARIFF_RATES = {
  [TariffFlag.GREEN]: 0,
  [TariffFlag.YELLOW]: 0.01885,
  [TariffFlag.RED_1]: 0.04463,
  [TariffFlag.RED_2]: 0.07877,
};


export interface BillComponents {
  consumptionCost: number;
  flagCost: number;
  taxes: number;
  total: number;
}

export class TariffCalculator {
  private baseRate: number;
  private taxRate: number;

  constructor(baseRate: number = 0.75, taxRate: number = 0.25) {
    this.baseRate = baseRate;
    this.taxRate = taxRate;
  }

  calculate(kwh: number, flag: TariffFlag): BillComponents {
    const consumptionCost = kwh * this.baseRate;
    const flagRate = TARIFF_RATES[flag];
    const flagCost = kwh * flagRate;

    const subtotal = consumptionCost + flagCost;
    const taxes = subtotal * this.taxRate;

    return {
      consumptionCost: parseFloat(consumptionCost.toFixed(2)),
      flagCost: parseFloat(flagCost.toFixed(2)),
      taxes: parseFloat(taxes.toFixed(2)),
      total: parseFloat((subtotal + taxes).toFixed(2))
    };
  }
}
