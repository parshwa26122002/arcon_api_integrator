// server.ts (Node.js)
import express from 'express';
import bodyParser from 'body-parser';
import { convert } from 'openapi-to-postmanv2';
 
const router = express.Router();
router.use(bodyParser.json({ limit: '10mb' }));
 
router.post('/convert', (req, res) => {
  const openapiSpec = req.body;
 
  convert({ type: 'json', data: openapiSpec }, {}, (err:any, result:any) => {
    if (err || !result.result) {
      return res.status(400).json({ error: 'Conversion failed', details: err });
    }
    res.json(result.output[0].data);
  });
});
 
export default router;