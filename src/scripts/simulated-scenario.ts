import * as df from 'danfojs-node';
import * as path from 'path';
import { FeatureEngineer } from '../core/features';
import { Forecaster } from '../core/forecaster';
import { TariffCalculator, TariffFlag } from '../utils/tariff-calculator';

async function runScenario() {
  console.log('--- Running AC Impact Scenario ---\n');

  const csvPath = path.join(__dirname, '../data/consumption.csv');
  const dfData = await df.readCSV(csvPath) as any;
  const columns = dfData.columns;
  const values = dfData.values as any[][];
  const jsonData = values.map((row) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
      });
      return obj;
  });

  
  const fe = new FeatureEngineer();
  const { X, y } = await fe.createFeatures(jsonData);


  
  const forecaster = new Forecaster();
  await forecaster.train(X, y);

  const acPowerKw = 1.2;
  const hoursPerDay = 8;
  const extraDailyKwh = acPowerKw * hoursPerDay;

  console.log(`Scenario: Adding AC (${acPowerKw}kW) usage for ${hoursPerDay}h/day.`);
  console.log(`Extra daily consumption: ${extraDailyKwh.toFixed(2)} kWh\n`);

  const daysFn = 30;
  const avgTemp = 21;

  let currentHistory = jsonData.map(d => parseFloat(d.consumption));
  
  let baselineTotalKwh = 0;

  let historyBuffer = [...currentHistory];
  const startDate = new Date(jsonData[jsonData.length-1].date);

  for (let i = 1; i <= daysFn; i++) {
      const futureDate = new Date(startDate);
      futureDate.setDate(startDate.getDate() + i);
      
      const features = fe.createSingleInput(avgTemp, futureDate, historyBuffer);
      const pred = (await forecaster.predict([features]))[0];
      
      baselineTotalKwh += pred;
      historyBuffer.push(pred);
  }

  const scenarioTotalKwh = baselineTotalKwh + (extraDailyKwh * daysFn);
  const calc = new TariffCalculator();
  const flag = TariffFlag.RED_2;
  
  const billBaseline = calc.calculate(baselineTotalKwh, flag);
  const billScenario = calc.calculate(scenarioTotalKwh, flag);

  console.log(`[Baseline 30-day Forecast]`);
  console.log(`Consumption: ${baselineTotalKwh.toFixed(2)} kWh`);
  console.log(`Bill: R$ ${billBaseline.total.toFixed(2)}\n`);

  console.log(`[With New AC 30-day Forecast]`);
  console.log(`Consumption: ${scenarioTotalKwh.toFixed(2)} kWh`);
  console.log(`Bill: R$ ${billScenario.total.toFixed(2)}\n`);

  const deltaCost = billScenario.total - billBaseline.total;
  console.log(`>> IMPACT: Increase of R$ ${deltaCost.toFixed(2)} in your monthly bill.`);
}

runScenario().catch(console.error);
