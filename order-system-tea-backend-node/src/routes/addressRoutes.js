const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

router.get('/list', auth, AddressController.getList);
router.post('/add', auth, AddressController.add);
router.put('/update', auth, AddressController.update);
router.delete('/delete/:id', auth, AddressController.delete);
router.put('/setDefault/:id', auth, AddressController.setDefault);
router.post('/checkDeliveryRange', AddressController.checkDeliveryRange);

module.exports = router;

