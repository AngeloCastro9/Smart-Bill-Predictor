import inventory from '../data/inventory.json';

export class Calculator {
  calculateDailyConsumption(temperature: number): number {
      let dailyKwh = 0;

      inventory.forEach((item: any) => {
          if (item.kwhPerCharge && item.chargesPerMonth) {
              const prob = item.chargesPerMonth / 30;
              if (Math.random() < prob) {
                  dailyKwh += item.kwhPerCharge;
              }
              return;
          }

          if (item.powerWatts !== undefined && item.hoursPerDay !== undefined) {
              let hours = item.hoursPerDay;
              const variance = (Math.random() * 0.4) - 0.2; 
              
              let actualHours = hours * (1 + variance);
              actualHours = Math.max(0, Math.min(24, actualHours));
              
              const kwh = (item.powerWatts * actualHours) / 1000;
              dailyKwh += kwh;
          }
      });

      return parseFloat(dailyKwh.toFixed(2));
  }
}
