import * as fs from 'fs';
import * as path from 'path';
import inventory from '../data/inventory.json';
import { Calculator } from '../core/calculator';

const startDate = new Date('2025-01-01');
const days = 365;

interface DataPoint {
  date: string;
  temperature: number;
  consumption: number;
}

const data: DataPoint[] = [];

console.log(`Generating data based on ${inventory.length} inventory items...`);

for (let i = 0; i < days; i++) {
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() + i);

  const temperature = 18 + Math.random() * 4;
  const calc = new Calculator();
  const consumption = calc.calculateDailyConsumption(temperature);

  data.push({
    date: currentDate.toISOString().split('T')[0],
    temperature: parseFloat(temperature.toFixed(1)),
    consumption: consumption
  });

}

const csvHeader = 'date,temperature,consumption\n';
const csvRows = data.map(row => `${row.date},${row.temperature},${row.consumption}`).join('\n');

const outPath = path.join(__dirname, '../data/consumption.csv');

const avgCons = data.reduce((a, b) => a + b.consumption, 0) / days;
console.log(`Average Daily Consumption: ${avgCons.toFixed(2)} kWh`);

fs.writeFileSync(outPath, csvHeader + csvRows);
console.log(`Generated ${days} days of data to ${outPath}`);
