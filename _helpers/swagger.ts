import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const swaggerPath = path.join(__dirname, '../swagger.yaml');
  if (fs.existsSync(swaggerPath)) {
    const swaggerDocument = yaml.load(fs.readFileSync(swaggerPath, 'utf8')) as object;
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}
