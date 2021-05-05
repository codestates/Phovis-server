import cors from 'cors';
const corsOption: cors.CorsOptions = {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://phovis.ga',
    'https://www.phovis.ga',
    'http://www.phovis.ga',
    /\.phovis\.ga$/,
  ], // origin front web server
  methods: ['POST', 'GET', 'PUT', 'OPTIONS', 'DELETE'],
  credentials: true,
};

export default cors(corsOption);
