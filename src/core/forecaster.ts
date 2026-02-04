export class Forecaster {
  private weights: number[] = [];
  private bias: number = 0;
  private isTrained: boolean = false;
  private learningRate: number = 0.0001; // Low LR for stability
  private epochs: number = 1000;

  constructor() {
  }


  async train(X: number[][], y: number[]) {
    if (X.length === 0) return;
    
    // Initialize weights
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0).map(() => Math.random() * 0.1);
    this.bias = 0;
    
    // Gradient Descent

    for (let epoch = 0; typeof epoch === 'number' && epoch < this.epochs; epoch++) {
        let totalError = 0;
        
        for (let i = 0; i < X.length; i++) {
            const features = X[i];
            const target = y[i];
            
            // Prediction
            const prediction = this.predictSingle(features);
            
            // Error
            const error = prediction - target;
            totalError += error * error;
            
            // Update weights (Gradient: 2 * error * input)
            // w = w - lr * gradient
            for (let j = 0; j < numFeatures; j++) {
                this.weights[j] -= this.learningRate * error * features[j];
            }
            this.bias -= this.learningRate * error;
        }
    }
    
    this.isTrained = true;

  }

  private predictSingle(features: number[]): number {
      let sum = this.bias;
      for (let i = 0; i < features.length; i++) {
          sum += features[i] * this.weights[i];
      }
      return sum;
  }

  async predict(X_new: number[][]): Promise<number[]> {
    if (!this.isTrained) {
      throw new Error("Model not trained yet!");
    }
    return X_new.map(row => this.predictSingle(row));
  }
  
  async updateModel(X_new: number[][], y_new: number[]) {
      this.epochs = 50; 
      await this.train(X_new, y_new);
  }

}
