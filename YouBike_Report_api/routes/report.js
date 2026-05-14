const express = require('express');
const router = express.Router();
const axios = require('axios');
const isAuth = require('../middleware/isAuth');
const { idToken } = require('../service/googleToken');

router.get('/gcpfun', isAuth, async (req, res, next) => {
  try {
    const payload = req.query;
    // 這裡的 GCP_URL 會指向那個巨大的 Cloud Run/frontend_bq2 
    const url = process.env.GCP_URL; 
    const gcptoken = await idToken();
    
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${gcptoken}` },
    });
    
    res.status(200).json({ message: "成功", data: response.data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;