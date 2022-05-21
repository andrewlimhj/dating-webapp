/* -------------------------------------------------------------------------- */
/*                                 dating app                                 */
/* -------------------------------------------------------------------------- */

import express from 'express';
import Server from 'socket.io';
import { createServer } from 'http';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import path from 'path';
import AuthRouter from './routes/auth.routes.js';
import DiscoverRouter from './routes/discover.routes.js';
import LikesRouter from './routes/likes.routes.js';
import ConversationRouter from './routes/conversation.routes.js';
import { socketIo } from './controllers/conversation.controller.js';
// import getARandomPhoto from './randomPhoto.js';

// const PORT = process.argv[2];
const PORT = process.env.PORT || 3004;

// aws
// const multerUpload = multer({ dest: 'uploads/' });

const app = express();
const http = createServer(app);
const io = new Server(http);

// serving the whole folder
const projectDirectory = './';
app.use(express.static(path.normalize(projectDirectory)));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static('uploads'));

/* --------------------------------- routes --------------------------------- */

const routers = [AuthRouter, DiscoverRouter, LikesRouter, ConversationRouter];

routers.forEach((router) => {
  app.use('/', router);
});

// chat function
socketIo(io);

http.listen(PORT, () => {
  console.log(`application running at ${PORT}`);
});
