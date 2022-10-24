import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import yaml, { JSON_SCHEMA } from 'js-yaml';
import {readFileSync} from 'fs';
import swaggerUi from 'swagger-ui-express';
dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

function ReadSwaggerConfig() {
    const configPath = path.join(process.cwd(), 'api', 'swagger', 'swagger.yaml');
    const swaggerYaml = readFileSync(configPath, 'utf-8');

    return yaml.load(swaggerYaml, {
        schema: JSON_SCHEMA,
        json: false
    });
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');
    next();
});
app.use('/serapis/:parameter', (req, res) => {
    res.redirect(`http://v8.serapis.19ivt.ru/${req.params.parameter}`);
});
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(ReadSwaggerConfig(), false));

app.listen(PORT, () => {
    console.log('API DOCS service started on', PORT);
})
