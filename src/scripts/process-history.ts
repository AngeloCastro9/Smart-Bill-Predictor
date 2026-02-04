import * as fs from 'fs';
import * as path from 'path';
import * as df from 'danfojs-node';
import { Calculator } from '../core/calculator';

async function processHistory() {
  const csvPath = path.join(__dirname, '../data/consumption.csv');
  console.log(`Processing ${csvPath}...`);

  const dfData = await df.readCSV(csvPath) as any;
  const ids = dfData.index;
  
  const columns = dfData.columns;
  const values = dfData.values as any[][];
  
  const calc = new Calculator();
  
  const newData = values.map((row) => {
      const date = row[0];
      const temp = parseFloat(row[1]);
      
      const newConsumption = calc.calculateDailyConsumption(temp);
      
      return {
          date: date,
          temperature: temp,
          consumption: newConsumption
      };
  });

  const header = 'date,temperature,consumption\n';
  const rows = newData.map(d => `${d.date},${d.temperature},${d.consumption}`).join('\n');
  
  fs.writeFileSync(csvPath, header + rows);
  console.log('Updated consumption.csv with calculated values based on inventory.');
}

processHistory().catch(console.error);
