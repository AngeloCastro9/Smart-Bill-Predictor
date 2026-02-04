import * as df from 'danfojs-node';
import * as path from 'path';
import { FeatureEngineer } from './core/features';
import { Forecaster } from './core/forecaster';
import { TariffCalculator, TariffFlag } from './utils/tariff-calculator';

async function main() {
  const csvPath = path.join(__dirname, 'data/consumption.csv');
  console.log(`Loading data from ${csvPath}...`);
  
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

  console.log('Generating features from history...');
  const fe = new FeatureEngineer();
  const { X, y } = await fe.createFeatures(jsonData);
  console.log('Training model on 2025 data...');
  const forecaster = new Forecaster();
  await forecaster.train(X, y);

  console.log('\nStarting 2026 Full Year Forecast...');
  
  const startDate = new Date('2026-01-01T12:00:00');
  const daysToPredict = 365;
  
  const historyConsumption = jsonData.map(d => parseFloat(d.consumption));
  
  const monthlyData: { [key: string]: number } = {};
  let annualTotal = 0;

  for (let i = 0; i < daysToPredict; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const simTemp = 18 + Math.random() * 4;
      
      const input = fe.createSingleInput(simTemp, currentDate, historyConsumption);
      
      const predArray = await forecaster.predict([input]);
      let predictedKwh = predArray[0];
      
      predictedKwh = Math.max(0, predictedKwh);
      
      historyConsumption.push(predictedKwh);
      
      const monthName = currentDate.toLocaleString('default', { month: 'long' });
      const monthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
      monthlyData[monthKey] += predictedKwh;
      annualTotal += predictedKwh;
  }

  console.log('\n--- 2026 Monthly Forecast (Projection) ---');
  console.log('Month\t\tConsumption (kWh)\tBill (R$)');
  console.log('----------------------------------------------------');
  
  const calculator = new TariffCalculator();
  let annualBill = 0;

  for (const monthKey of Object.keys(monthlyData).sort()) {
      const kwh = monthlyData[monthKey];
      
      const monthIndex = parseInt(monthKey.split('-')[1]) - 1;
      const dateForFlag = new Date(2026, monthIndex, 1);
      const flag = TariffCalculator.predictTariff(dateForFlag);
      
      const bill = calculator.calculate(kwh, flag);
      annualBill += bill.total;
      
      console.log(`${monthKey}\t\t${kwh.toFixed(2)}\t\tR$ ${bill.total.toFixed(2)}\t(${flag})`);
  }

  const avgFlag = "VARIES";


  console.log('----------------------------------------------------');
  console.log(`[TOTAL 2026]`);
  console.log(`Consumption: ${annualTotal.toFixed(2)} kWh`);
  console.log(`Total Cost:  R$ ${annualBill.toFixed(2)} (Seasonal Flags Applied)`);

}

main().catch(console.error);
