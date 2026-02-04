export interface ModelFeatures {
  X: number[][];
  y: number[];
}

export class FeatureEngineer {
  
  async createFeatures(data: any[]): Promise<ModelFeatures> {
    if (!Array.isArray(data)) {
         throw new Error("createFeatures expects an array of objects");
    }
    const dates = data.map(d => new Date(d.date));
    const temperatures = data.map(d => parseFloat(d.temperature));
    const consumptions = data.map(d => parseFloat(d.consumption));

    const dayOfWeek = dates.map(d => d.getDay());
    const month = dates.map(d => d.getMonth());

    const lag1: number[] = [];
    const lag7: number[] = [];
    const rollingMean3: number[] = [];

    for (let i = 0; i < consumptions.length; i++) {
        lag1.push(i >= 1 ? consumptions[i-1] : 0);
        lag7.push(i >= 7 ? consumptions[i-7] : 0);
        
        if (i >= 3) {
            const sum = consumptions[i-1] + consumptions[i-2] + consumptions[i-3];
            rollingMean3.push(sum / 3);
        } else {
            rollingMean3.push(0);
        }
    }

    const startIdx = 7;
    
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = startIdx; i < consumptions.length; i++) {
        X.push([
            temperatures[i],
            dayOfWeek[i],
            month[i],
            lag1[i],
            lag7[i],
            rollingMean3[i]
        ]);
        y.push(consumptions[i]);
    }

    return { X, y };
  }

  createSingleInput(
      temperature: number, 
      date: Date, 
      recentConsumption: number[]
  ): number[] {
      const last = recentConsumption.length;
      if (last < 7) throw new Error("Need at least 7 days of history");

      const lag1 = recentConsumption[last - 1];
      const lag7 = recentConsumption[last - 7];
      
      const last3 = recentConsumption.slice(last - 3);
      const rollingMean3 = last3.reduce((a, b) => a + b, 0) / last3.length;

      return [
          temperature,
          date.getDay(),
          date.getMonth(),
          lag1,
          lag7,
          rollingMean3
      ];
  }
}
