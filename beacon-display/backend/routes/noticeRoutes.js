// const express = require('express');
// const router = express.Router();
// const noticeController = require('../controllers/noticeController');
// const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
// const { upload } = require('../config/cloudinary');

// module.exports = (io) => {
//   // GET /api/notices/published - Get published notices (public) - MUST come first!
//   router.get('/published', (req, res) => {
//     noticeController.getPublishedNotices(req, res);
//   });

//   // GET /api/notices - Get all notices (admin)
//   router.get('/', authMiddleware, (req, res) => {
//     noticeController.getAllNotices(req, res);
//   });

//   // POST /api/notices/upload - Upload and create notice (admin)
//   router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
//     noticeController.createNotice(req, res, io);
//   });

//   // PUT /api/notices/:id - Update notice (admin)
//   router.put('/:id', authMiddleware, (req, res) => {
//     noticeController.updateNotice(req, res, io);
//   });

//   // PATCH /api/notices/:id/toggle - Toggle publish status (admin)
//   router.patch('/:id/toggle', authMiddleware, (req, res) => {
//     noticeController.togglePublish(req, res, io);
//   });

//   // DELETE /api/notices/:id - Delete notice (admin)
//   router.delete('/:id', authMiddleware, (req, res) => {
//     noticeController.deleteNotice(req, res, io);
//   });

//   return router;
// };

const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

module.exports = (io) => {
  // Public: GET published notices
  router.get('/published', noticeController.getPublishedNotices);

  // Admin protected routes - require both auth and admin role
  router.get('/', authMiddleware, adminMiddleware, noticeController.getAllNotices);
  router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), (req, res) => {
    noticeController.createNotice(req, res, io);
  });
  router.put('/:id', authMiddleware, adminMiddleware, (req, res) =>
    noticeController.updateNotice(req, res, io)
  );
  router.patch('/:id/toggle', authMiddleware, adminMiddleware, (req, res) =>
    noticeController.togglePublish(req, res, io)
  );
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res) =>
    noticeController.deleteNotice(req, res, io)
  );

  return router;
};
